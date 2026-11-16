
from fastapi import (
    APIRouter, Depends, HTTPException, Request
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.limits import throttle
from app.core.security import (
    require_admin, require_agent_or_admin
)
from app.db.session import get_db
from app.models.tables import SiteVisit, User
from app.schemas.dto import VisitIn, VisitPatch, VisitRead
from app.services.crm import create_visit, update_visit


public = APIRouter(
    prefix="/site-visits",
    tags=["Public site visits"]
)
admin = APIRouter(
    prefix="/admin/visits",
    tags=["Admin visits"]
)
agent = APIRouter(
    prefix="/agent/visits",
    tags=["Agent visits"]
)


@public.post(
    "", response_model=VisitRead,
    status_code=201
)
def request_visit(
    request: Request,
    payload: VisitIn,
    db: Session = Depends(get_db)
):
    throttle(request, "site_visit", 6, 3600)
    return create_visit(db, payload)


@admin.get("", response_model=list[VisitRead])
def all_visits(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return db.scalars(
        select(SiteVisit)
        .order_by(SiteVisit.created_at.desc())
        .limit(100)
    ).all()


@admin.patch(
    "/{visit_id}", response_model=VisitRead
)
def admin_update(
    visit_id: str,
    payload: VisitPatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    record = db.get(SiteVisit, visit_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    return update_visit(
        db, record, payload, user
    )


@agent.get("", response_model=list[VisitRead])
def assigned_visits(
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    return db.scalars(
        select(SiteVisit)
        .where(SiteVisit.assigned_agent_id == user.id)
        .order_by(SiteVisit.created_at.desc())
        .limit(100)
    ).all()


@agent.patch(
    "/{visit_id}", response_model=VisitRead
)
def agent_update(
    visit_id: str,
    payload: VisitPatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    record = db.get(SiteVisit, visit_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    return update_visit(
        db, record, payload, user
    )
