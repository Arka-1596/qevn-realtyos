
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tables import (
    Lead, LeadActivity, LeadNote,
    Property, SiteVisit, User
)
from app.schemas.dto import (
    AgentLeadPatch, LeadIn, LeadPatch,
    NoteIn, VisitIn, VisitPatch
)


def get_published_property(
    db: Session, property_id: str
) -> Property:
    item = db.get(Property, property_id)

    if item is None or not item.is_published:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )
    return item


def create_lead(
    db: Session,
    data: LeadIn,
    source: str = "WEBSITE",
    *,
    commit: bool = True
) -> Lead:
    if data.property_id:
        get_published_property(db, data.property_id)

    lead = Lead(
        **data.model_dump(),
        source=source,
        status="NEW"
    )
    db.add(lead)
    db.flush()

    db.add(
        LeadActivity(
            lead_id=lead.id,
            action_type="CREATED",
            new_value=source
        )
    )

    if commit:
        db.commit()
        db.refresh(lead)

    return lead


def update_lead(
    db: Session,
    lead: Lead,
    data: LeadPatch | AgentLeadPatch,
    actor: User
) -> Lead:
    changes = data.model_dump(exclude_unset=True)

    permitted_transitions = {
        "NEW": {"CONTACTED", "LOST"},
        "CONTACTED": {"QUALIFIED", "LOST"},
        "QUALIFIED": {"VISIT_SCHEDULED", "NEGOTIATION", "LOST"},
        "VISIT_SCHEDULED": {"NEGOTIATION", "WON", "LOST"},
        "NEGOTIATION": {"WON", "LOST"},
        "WON": set(),
        "LOST": set(),
    }
    if "status" in changes and changes["status"] is not None:
        proposed = changes["status"].value
        if proposed != lead.status and proposed not in permitted_transitions.get(lead.status, set()):
            raise HTTPException(status_code=409, detail="Invalid lead status transition")

    if (
        "assigned_agent_id" in changes
        and changes["assigned_agent_id"]
    ):
        assignee = db.get(
            User, changes["assigned_agent_id"]
        )

        if (
            not assignee
            or assignee.role != "AGENT"
            or not assignee.is_active
        ):
            raise HTTPException(
                status_code=422,
                detail="Invalid active agent"
            )

    if (
        changes.get("next_follow_up_at")
        and changes["next_follow_up_at"].tzinfo is None
    ):
        raise HTTPException(
            status_code=422,
            detail="Follow-up datetime needs timezone"
        )

    for field, new_value in changes.items():
        previous = getattr(lead, field)

        if hasattr(new_value, "value"):
            new_value = new_value.value

        if previous != new_value:
            setattr(lead, field, new_value)

            db.add(
                LeadActivity(
                    lead_id=lead.id,
                    actor_id=actor.id,
                    action_type=field.upper(),
                    previous_value=str(previous),
                    new_value=str(new_value)
                )
            )

    db.commit()
    db.refresh(lead)
    return lead


def add_note(
    db: Session,
    lead: Lead,
    actor: User,
    payload: NoteIn
) -> LeadNote:
    note = LeadNote(
        lead_id=lead.id,
        author_id=actor.id,
        content=payload.content
    )

    db.add(note)
    db.add(
        LeadActivity(
            lead_id=lead.id,
            actor_id=actor.id,
            action_type="NOTE_ADDED"
        )
    )

    db.commit()
    db.refresh(note)
    return note


def create_visit(
    db: Session,
    data: VisitIn,
    source: str = "WEBSITE"
) -> SiteVisit:
    get_published_property(db, data.property_id)

    lead = create_lead(
        db,
        LeadIn(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            property_id=data.property_id,
            message=data.customer_notes
        ),
        source=source,
        commit=False
    )

    visit = SiteVisit(
        property_id=data.property_id,
        lead_id=lead.id,
        preferred_start_at=data.preferred_start_at,
        status="REQUESTED",
        customer_notes=data.customer_notes
    )

    db.add(visit)
    db.flush()

    db.add(
        LeadActivity(
            lead_id=lead.id,
            action_type="VISIT_REQUESTED",
            new_value=visit.id
        )
    )

    db.commit()
    db.refresh(visit)
    return visit


def update_visit(
    db: Session,
    visit: SiteVisit,
    payload: VisitPatch,
    actor: User
) -> SiteVisit:
    proposed_status = payload.status.value
    allowed_transitions = {
        "REQUESTED": {"CONFIRMED", "CANCELLED"},
        "CONFIRMED": {"COMPLETED", "CANCELLED"},
        "COMPLETED": set(),
        "CANCELLED": set(),
    }
    if (
        proposed_status != visit.status
        and proposed_status not in allowed_transitions.get(visit.status, set())
    ):
        raise HTTPException(status_code=409, detail="Invalid visit status transition")

    if (
        visit.status in {"COMPLETED", "CANCELLED"}
        and proposed_status != visit.status
    ):
        raise HTTPException(
            status_code=409,
            detail="Finalized visit cannot change status"
        )

    if (
        actor.role == "AGENT"
        and visit.assigned_agent_id != actor.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not assigned to visit"
        )

    if (
        payload.assigned_agent_id
        and actor.role != "ADMIN"
    ):
        raise HTTPException(
            status_code=403,
            detail="Only Admin can assign visits"
        )

    assigned = (
        payload.assigned_agent_id
        or visit.assigned_agent_id
    )

    if payload.assigned_agent_id:
        agent = db.get(
            User, payload.assigned_agent_id
        )

        if (
            not agent
            or agent.role != "AGENT"
            or not agent.is_active
        ):
            raise HTTPException(
                status_code=422,
                detail="Invalid active agent"
            )

        db.execute(
            select(User)
            .where(User.id == agent.id)
            .with_for_update()
        ).scalar_one()

    elif assigned and proposed_status == "CONFIRMED":
        db.execute(
            select(User)
            .where(User.id == assigned)
            .with_for_update()
        ).scalar_one()

    if proposed_status == "CONFIRMED":
        if not assigned:
            raise HTTPException(
                status_code=422,
                detail="Assign an agent before confirming"
            )

        when = (
            payload.confirmed_start_at
            or visit.confirmed_start_at
            or visit.preferred_start_at
        )

        if when.tzinfo is None:
            raise HTTPException(
                status_code=422,
                detail="Confirmation datetime needs timezone"
            )

        when = when.astimezone(timezone.utc)
        if when <= datetime.now(timezone.utc):
            raise HTTPException(status_code=422, detail="Confirmed visit must be in the future")

        # Each demonstration visit occupies 60 minutes.
        existing = db.scalars(
            select(SiteVisit).where(
                SiteVisit.id != visit.id,
                SiteVisit.assigned_agent_id == assigned,
                SiteVisit.status == "CONFIRMED",
                SiteVisit.confirmed_start_at >= (
                    when - timedelta(minutes=59)
                ),
                SiteVisit.confirmed_start_at < (
                    when + timedelta(minutes=60)
                ),
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Agent already has a visit near that time"
            )

        visit.confirmed_start_at = when

    if payload.agent_notes is not None:
        visit.agent_notes = payload.agent_notes

    if payload.assigned_agent_id is not None:
        visit.assigned_agent_id = payload.assigned_agent_id

    visit.status = proposed_status

    db.add(
        LeadActivity(
            lead_id=visit.lead_id,
            actor_id=actor.id,
            action_type="VISIT_STATUS",
            new_value=proposed_status
        )
    )

    db.commit()
    db.refresh(visit)
    return visit
