from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
import pytest
from sqlalchemy import select

from app.ai.agent_service import _execute_tool
from app.models.tables import AIConversation, Lead, SiteVisit
from app.schemas.dto import LeadIn, LeadPatch, VisitIn, VisitPatch
from app.services.crm import create_lead, create_visit, update_lead, update_visit


def test_prevent_invalid_lead_transition(db_and_client):
    db, _, admin, _, _, listing = db_and_client
    lead = create_lead(
        db,
        LeadIn(
            full_name="Demo Customer",
            email="demo@example.com",
            phone="+919876543210",
            property_id=listing.id,
        ),
    )
    with pytest.raises(HTTPException) as error:
        update_lead(db, lead, LeadPatch(status="WON"), admin)
    assert error.value.status_code == 409
    assert db.get(Lead, lead.id).status == "NEW"


def test_prevent_invalid_visit_transition(db_and_client):
    db, _, admin, agent, _, listing = db_and_client
    when = datetime.now(timezone.utc) + timedelta(days=2)
    visit = create_visit(
        db,
        VisitIn(
            property_id=listing.id,
            full_name="Demo Customer",
            email="demo@example.com",
            phone="+919876543210",
            preferred_start_at=when,
        ),
    )
    with pytest.raises(HTTPException) as error:
        update_visit(db, visit, VisitPatch(status="COMPLETED"), admin)
    assert error.value.status_code == 409
    assert db.get(SiteVisit, visit.id).status == "REQUESTED"


def test_reject_invalid_price_bounds(db_and_client):
    _, client, *_ = db_and_client
    response = client.get("/api/v1/properties?min_price=200&max_price=100")
    assert response.status_code == 422


def test_ai_rejects_unpublished_property(db_and_client):
    db, _, _, _, _, _ = db_and_client
    conversation = AIConversation(anonymous_session_hash="test-session")
    db.add(conversation)
    db.flush()
    unpublished = db.scalar(select(__import__("app.models.tables", fromlist=["Property"]).Property).where(
        __import__("app.models.tables", fromlist=["Property"]).Property.slug == "private-demo"
    ))
    with pytest.raises(HTTPException) as error:
        _execute_tool(db, conversation, "test-session", "get_property_details",
                      {"property_id": unpublished.id})
    assert error.value.status_code == 404
