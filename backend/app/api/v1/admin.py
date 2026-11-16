
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password, require_admin
from app.db.session import get_db
from app.models.tables import (
    Lead, Property, SiteVisit, User, utcnow
)
from app.schemas.dto import AgentIn, AgentPatch, UserRead


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    by_status = db.execute(
        select(Lead.status, func.count())
        .group_by(Lead.status)
    ).all()

    return {
        "total_properties": db.scalar(
            select(func.count()).select_from(Property)
        ) or 0,
        "active_properties": db.scalar(
            select(func.count()).select_from(Property)
            .where(Property.is_published.is_(True))
        ) or 0,
        "total_leads": db.scalar(
            select(func.count()).select_from(Lead)
        ) or 0,
        "new_leads": db.scalar(
            select(func.count()).select_from(Lead)
            .where(Lead.status == "NEW")
        ) or 0,
        "leads_by_status": {
            name: count for name, count in by_status
        },
        "requested_visits": db.scalar(
            select(func.count()).select_from(SiteVisit)
            .where(SiteVisit.status == "REQUESTED")
        ) or 0,
        "confirmed_visits": db.scalar(
            select(func.count()).select_from(SiteVisit)
            .where(SiteVisit.status == "CONFIRMED")
        ) or 0,
        "upcoming_follow_ups": db.scalar(
            select(func.count()).select_from(Lead)
            .where(Lead.next_follow_up_at >= utcnow())
        ) or 0,
        "recent_leads": [
            {
                "id": a.id,
                "full_name": a.full_name,
                "status": a.status
            }
            for a in db.scalars(
                select(Lead)
                .order_by(Lead.created_at.desc())
                .limit(5)
            )
        ],
    }


@router.get("/agents", response_model=list[UserRead])
def list_agents(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return db.scalars(
        select(User).where(User.role == "AGENT")
    ).all()


@router.post(
    "/agents",
    response_model=UserRead,
    status_code=201
)
def create_agent(
    payload: AgentIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    email = str(payload.email).lower()

    if db.scalar(
        select(User.id).where(User.email == email)
    ):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user = User(
        full_name=payload.full_name,
        email=email,
        role="AGENT",
        password_hash=hash_password(payload.password),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.patch(
    "/agents/{agent_id}",
    response_model=UserRead
)
def update_agent(
    agent_id: str,
    payload: AgentPatch,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    agent = db.get(User, agent_id)

    if not agent or agent.role != "AGENT":
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    for key, value in payload.model_dump(
        exclude_unset=True
    ).items():
        setattr(agent, key, value)

    # Historical records are preserved.
    db.commit()
    db.refresh(agent)

    return agent
