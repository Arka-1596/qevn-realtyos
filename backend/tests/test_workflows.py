
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.ai.agent_service import _pending, confirm
from app.core.security import digest
from app.models.tables import AIConversation, Lead
from tests.conftest import login


def test_health(db_and_client):
    _, client, *_ = db_and_client
    result = client.get("/health")

    assert result.status_code == 200
    assert result.json()["status"] == "ok"


def test_public_search_hides_private(db_and_client):
    _, client, *_ = db_and_client

    result = client.get(
        "/api/v1/properties"
        "?city=Kolkata&bhk=3&max_price=8500000"
    )

    assert result.status_code == 200
    assert result.json()["total"] == 1

    private_result = client.get(
        "/api/v1/properties/private-demo"
    )

    assert private_result.status_code == 404


def test_enquiry_and_agent_permissions(db_and_client):
    db, client, admin, agent, other, listing = db_and_client

    submitted = client.post(
        "/api/v1/leads",
        json={
            "full_name": "Interested Customer",
            "email": "customer@example.com",
            "phone": "+919876543210",
            "property_id": listing.id,
            "message": "I would like details"
        }
    )

    assert submitted.status_code == 201
    lead_id = submitted.json()["id"]

    assert (
        client.get("/api/v1/admin/leads").status_code
        == 401
    )

    csrf = login(
        client,
        "admin@example.com",
        "verystrong-admin-password"
    )

    assigned = client.patch(
        f"/api/v1/admin/leads/{lead_id}",
        headers=csrf,
        json={
            "assigned_agent_id": agent.id,
            "status": "CONTACTED"
        }
    )

    assert assigned.status_code == 200
    assert assigned.json()["status"] == "CONTACTED"

    client.post(
        "/api/v1/auth/logout",
        headers=csrf
    )

    csrf_other = login(
        client,
        "agent2@example.com",
        "verystrong-other-password"
    )

    assert client.get(
        f"/api/v1/agent/leads/{lead_id}"
    ).status_code == 403

    client.post(
        "/api/v1/auth/logout",
        headers=csrf_other
    )

    csrf_agent = login(
        client,
        "agent1@example.com",
        "verystrong-agent-password"
    )

    note = client.post(
        f"/api/v1/agent/leads/{lead_id}/notes",
        headers=csrf_agent,
        json={
            "content": "Customer requested callback"
        }
    )

    assert note.status_code == 201
    assert note.json()["author_id"] == agent.id
    assert db.get(Lead, lead_id).assigned_agent_id == agent.id


def test_visit_request_and_confirmation(db_and_client):
    db, client, admin, agent, other, listing = db_and_client

    at = (
        datetime.now(timezone.utc) + timedelta(days=3)
    ).isoformat()

    created = client.post(
        "/api/v1/site-visits",
        json={
            "property_id": listing.id,
            "full_name": "Visit Customer",
            "email": "visit@example.com",
            "phone": "+919876543210",
            "preferred_start_at": at
        }
    )

    assert created.status_code == 201
    visit = created.json()
    assert visit["status"] == "REQUESTED"

    csrf = login(
        client,
        "admin@example.com",
        "verystrong-admin-password"
    )

    confirmed = client.patch(
        f"/api/v1/admin/visits/{visit['id']}",
        headers=csrf,
        json={
            "status": "CONFIRMED",
            "assigned_agent_id": agent.id,
            "confirmed_start_at": at
        }
    )

    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "CONFIRMED"


def test_ai_requires_confirmation(db_and_client):
    db, client, admin, agent, other, listing = db_and_client

    conversation = AIConversation(
        anonymous_session_hash=digest("browser-token")
    )
    db.add(conversation)
    db.flush()

    result = _pending(
        db,
        conversation,
        digest("browser-token"),
        "create_lead",
        {
            "full_name": "AI Customer",
            "email": "ai@example.com",
            "phone": "+919876543210",
            "property_id": listing.id,
            "message": "Please contact me"
        }
    )

    db.commit()

    assert db.query(Lead).filter(
        Lead.email == "ai@example.com"
    ).count() == 0

    response = confirm(
        db,
        result["confirmation_ref"],
        digest("browser-token")
    )

    assert response["success"]

    assert db.query(Lead).filter(
        Lead.email == "ai@example.com"
    ).count() == 1

    try:
        confirm(
            db,
            result["confirmation_ref"],
            digest("browser-token")
        )
        assert False, "Token must not be accepted twice"
    except HTTPException as exc:
        assert exc.status_code == 409


def test_agent_cannot_edit_property(db_and_client):
    _, client, *_ = db_and_client

    csrf = login(
        client,
        "agent1@example.com",
        "verystrong-agent-password"
    )

    result = client.post(
        "/api/v1/admin/properties",
        headers=csrf,
        json={
            "title": "Trying to create a property",
            "description": (
                "This must be rejected for an Agent account."
            ),
            "city": "Kolkata",
            "property_type": "APARTMENT",
            "price": "1200000",
            "bhk": 1,
            "bathrooms": 1,
            "area_sqft": 500
        }
    )

    assert result.status_code == 403


def test_invalid_visit_date_rejected(db_and_client):
    _, client, _, _, _, listing = db_and_client

    result = client.post(
        "/api/v1/site-visits",
        json={
            "property_id": listing.id,
            "full_name": "Customer Example",
            "email": "customer@example.com",
            "phone": "+919876543210",
            "preferred_start_at": (
                "2020-01-01T10:00:00+05:30"
            )
        }
    )

    assert result.status_code == 422
