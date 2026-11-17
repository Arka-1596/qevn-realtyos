
import re
import secrets
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.agent_service import chat, confirm
from app.core.config import get_settings
from app.core.limits import throttle
from app.core.security import AI_COOKIE, digest
from app.db.session import get_db
from app.models.tables import AIMessage, Property
from app.schemas.dto import (
    AIChatIn,
    AIConfirmIn,
    PropertyRead,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Concierge"],
)

settings = get_settings()


def anonymous_token(request: Request, response: Response):
    token = request.cookies.get(AI_COOKIE)

    if not token:
        token = secrets.token_urlsafe(36)

        response.set_cookie(
            AI_COOKIE,
            token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite="lax",
            path="/",
            max_age=30 * 24 * 3600,
        )

    return digest(token)


def verified_listing_search(
    db: Session,
    message: str,
) -> list[dict]:
    """
    Conservative database-only recovery for explicit
    property searches. Never generates imaginary listings.
    """
    text = message.casefold()

    query = select(Property).where(
        Property.is_published.is_(True)
    )

    has_filter = False

    bhk_match = re.search(
        r"\b(\d{1,2})\s*bhk\b",
        text,
    )

    if bhk_match:
        bhk = int(bhk_match.group(1))

        if 0 <= bhk <= 20:
            query = query.where(Property.bhk == bhk)
            has_filter = True

    localities = db.scalars(
        select(Property.locality)
        .where(Property.is_published.is_(True))
        .distinct()
    ).all()

    matching_localities = [
        name for name in localities
        if name and len(name) >= 3
        and name.casefold() in text
    ]

    if matching_localities:
        locality = max(
            matching_localities,
            key=len,
        )

        query = query.where(
            Property.locality.ilike(
                f"%{locality}%"
            )
        )

        has_filter = True

    cities = db.scalars(
        select(Property.city)
        .where(Property.is_published.is_(True))
        .distinct()
    ).all()

    matching_cities = [
        city for city in cities
        if city and len(city) >= 3
        and city.casefold() in text
    ]

    if matching_cities:
        city = max(
            matching_cities,
            key=len,
        )

        query = query.where(
            Property.city.ilike(
                f"%{city}%"
            )
        )

        has_filter = True

    budget_match = re.search(
        r"(?:under|below|less than|up to|upto)\s*"
        r"(?:₹\s*|rs\.?\s*|inr\s*)?"
        r"([\d,]+(?:\.\d+)?)\s*"
        r"(crores?|cr|lakhs?|lacs?|million|inr)?",
        text,
    )

    if budget_match:
        try:
            amount = Decimal(
                budget_match.group(1).replace(",", "")
            )

            unit = (
                budget_match.group(2) or ""
            ).lower()

            if unit.startswith(("crore", "cr")):
                amount *= Decimal("10000000")

            elif unit.startswith(("lakh", "lac")) or unit == "l":
                amount *= Decimal("100000")

            elif unit == "million":
                amount *= Decimal("1000000")

            if amount >= 0:
                query = query.where(
                    Property.price <= amount
                )
                has_filter = True

        except InvalidOperation:
            pass

    if not has_filter:
        return []

    records = db.scalars(
        query.order_by(
            Property.created_at.desc(),
            Property.id.desc(),
        ).limit(5)
    ).all()

    return [
        PropertyRead.model_validate(record).model_dump(
            mode="json"
        )
        for record in records
    ]


def recover_search_response(
    db: Session,
    user_message: str,
    result: dict,
) -> dict:
    if result.get("pending_action"):
        return result

    message = result.get("message", "")

    incomplete = message in (
        "Please narrow your request and try again.",
        "Please try asking again.",
    )

    matches = result.get("property_matches") or []

    user_is_searching = bool(
        re.search(
            r"\b(find|show|search|list|available|properties|apartments|houses)\b",
            user_message,
            re.IGNORECASE,
        )
    )

    if not incomplete and (
        matches or not user_is_searching
    ):
        return result

    if not matches:
        matches = verified_listing_search(
            db,
            user_message,
        )

    if not matches:
        return result

    summaries = []

    for item in matches[:5]:
        summaries.append(
            f"{item['title']} — "
            f"{item['locality']}, {item['city']} — "
            f"INR {item['price']}"
        )

    explanation = (
        "I checked the published RealtyOS property "
        "database and found these matching listings:\n\n"
        + "\n".join(summaries)
        + "\n\nThese are database-verified demo records. "
        "You can open a listing to enquire or request "
        "a site visit."
    )

    result["message"] = explanation
    result["property_matches"] = matches

    # Keep the recorded conversation consistent with
    # the verified response shown to the customer.
    stored_message = db.scalar(
        select(AIMessage)
        .where(
            AIMessage.conversation_id
            == result["conversation_id"],
            AIMessage.role == "assistant",
        )
        .order_by(
            AIMessage.created_at.desc(),
            AIMessage.id.desc(),
        )
        .limit(1)
    )

    if stored_message and stored_message.content == message:
        stored_message.content = explanation
        db.commit()

    return result


@router.post("/chat")
def ai_chat(
    request: Request,
    response: Response,
    data: AIChatIn,
    db: Session = Depends(get_db),
):
    throttle(request, "ai_chat", 20, 3600)

    session_hash = anonymous_token(
        request,
        response,
    )

    result = chat(
        db,
        data.conversation_id,
        session_hash,
        data.message,
    )

    return recover_search_response(
        db,
        data.message,
        result,
    )


@router.post("/actions/confirm")
def ai_confirm(
    request: Request,
    response: Response,
    data: AIConfirmIn,
    db: Session = Depends(get_db),
):
    throttle(request, "ai_confirm", 10, 3600)

    session_hash = anonymous_token(
        request,
        response,
    )

    return confirm(
        db,
        data.confirmation_ref,
        session_hash,
    )
