
import secrets

from fastapi import (
    APIRouter, Depends, Request, Response
)
from sqlalchemy.orm import Session

from app.ai.agent_service import chat, confirm
from app.core.config import get_settings
from app.core.limits import throttle
from app.core.security import AI_COOKIE, digest
from app.db.session import get_db
from app.schemas.dto import AIChatIn, AIConfirmIn


router = APIRouter(
    prefix="/ai", tags=["AI Concierge"]
)
settings = get_settings()


def anonymous_token(
    request: Request,
    response: Response
):
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
            max_age=30 * 24 * 3600
        )

    return digest(token)


@router.post("/chat")
def ai_chat(
    request: Request,
    response: Response,
    data: AIChatIn,
    db: Session = Depends(get_db)
):
    throttle(request, "ai_chat", 20, 3600)

    session_hash = anonymous_token(
        request, response
    )

    return chat(
        db,
        data.conversation_id,
        session_hash,
        data.message
    )


@router.post("/actions/confirm")
def ai_confirm(
    request: Request,
    response: Response,
    data: AIConfirmIn,
    db: Session = Depends(get_db)
):
    throttle(request, "ai_confirm", 10, 3600)

    session_hash = anonymous_token(
        request, response
    )

    return confirm(
        db,
        data.confirmation_ref,
        session_hash
    )
