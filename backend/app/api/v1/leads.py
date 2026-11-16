
from fastapi import (
    APIRouter, Depends, HTTPException,
    Query, Request
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.limits import throttle
from app.core.permissions import can_access_lead
from app.core.security import (
    require_admin, require_agent_or_admin
)
from app.db.session import get_db
from app.models.tables import Lead, LeadActivity, User
from app.schemas.dto import (
    AgentLeadPatch, LeadCreated, LeadIn,
    LeadPatch, LeadRead, NoteIn, NoteRead
)
from app.services.crm import (
    add_note, create_lead, update_lead
)


public = APIRouter(
    prefix="/leads", tags=["Public enquiries"]
)
admin = APIRouter(
    prefix="/admin/leads", tags=["Admin leads"]
)
agent = APIRouter(
    prefix="/agent/leads", tags=["Agent leads"]
)


@public.post(
    "", response_model=LeadCreated,
    status_code=201
)
def submit_enquiry(
    request: Request,
    payload: LeadIn,
    db: Session = Depends(get_db)
):
    throttle(request, "enquiry", 6, 3600)
    created = create_lead(db, payload)

    return LeadCreated(
        id=created.id,
        status=created.status
    )


def get_lead(db: Session, lead_id: str) -> Lead:
    item = db.get(Lead, lead_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return item


@admin.get("")
def admin_list(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    conditions = (
        [Lead.status == status] if status else []
    )

    total = db.scalar(
        select(func.count())
        .select_from(Lead)
        .where(*conditions)
    ) or 0

    records = db.scalars(
        select(Lead)
        .where(*conditions)
        .order_by(
            Lead.created_at.desc(),
            Lead.id.desc()
        )
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    return {
        "items": [
            LeadRead.model_validate(x)
            .model_dump(mode="json")
            for x in records
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


@admin.get(
    "/{lead_id}", response_model=LeadRead
)
def admin_detail(
    lead_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return get_lead(db, lead_id)


@admin.patch(
    "/{lead_id}", response_model=LeadRead
)
def admin_update(
    lead_id: str,
    payload: LeadPatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    return update_lead(
        db, get_lead(db, lead_id), payload, user
    )


@admin.post(
    "/{lead_id}/notes",
    response_model=NoteRead,
    status_code=201
)
def admin_note(
    lead_id: str,
    payload: NoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    return add_note(
        db, get_lead(db, lead_id), user, payload
    )


@admin.get("/{lead_id}/activity")
def admin_activity(
    lead_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    get_lead(db, lead_id)

    activity = db.scalars(
        select(LeadActivity)
        .where(LeadActivity.lead_id == lead_id)
        .order_by(LeadActivity.created_at.desc())
        .limit(100)
    ).all()

    return [
        {
            "action_type": x.action_type,
            "previous_value": x.previous_value,
            "new_value": x.new_value,
            "created_at": x.created_at
        }
        for x in activity
    ]


@agent.get("")
def agent_list(
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    records = db.scalars(
        select(Lead)
        .where(Lead.assigned_agent_id == user.id)
        .order_by(Lead.created_at.desc())
        .limit(100)
    ).all()

    return [
        LeadRead.model_validate(x)
        for x in records
    ]


@agent.get(
    "/{lead_id}", response_model=LeadRead
)
def agent_detail(
    lead_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    lead = get_lead(db, lead_id)
    can_access_lead(user, lead)
    return lead


@agent.patch(
    "/{lead_id}", response_model=LeadRead
)
def agent_update(
    lead_id: str,
    payload: AgentLeadPatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    lead = get_lead(db, lead_id)
    can_access_lead(user, lead)

    return update_lead(
        db, lead, payload, user
    )


@agent.post(
    "/{lead_id}/notes",
    response_model=NoteRead,
    status_code=201
)
def agent_note(
    lead_id: str,
    payload: NoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_agent_or_admin)
):
    lead = get_lead(db, lead_id)
    can_access_lead(user, lead)

    return add_note(
        db, lead, user, payload
    )
