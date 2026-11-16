
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.tables import Property, User


@pytest.fixture
def db_and_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    Base.metadata.create_all(engine)

    TestingSession = sessionmaker(
        bind=engine,
        expire_on_commit=False
    )

    db = TestingSession()

    admin = User(
        full_name="Admin Example",
        email="admin@example.com",
        role="ADMIN",
        password_hash=hash_password(
            "verystrong-admin-password"
        )
    )

    agent = User(
        full_name="Agent One",
        email="agent1@example.com",
        role="AGENT",
        password_hash=hash_password(
            "verystrong-agent-password"
        )
    )

    other_agent = User(
        full_name="Agent Two",
        email="agent2@example.com",
        role="AGENT",
        password_hash=hash_password(
            "verystrong-other-password"
        )
    )

    db.add_all([admin, agent, other_agent])
    db.flush()

    listing = Property(
        title="Test Kolkata 3BHK Home",
        slug="test-kolkata-3bhk",
        city="Kolkata",
        locality="New Town",
        description="Fictional test apartment property, not real.",
        property_type="APARTMENT",
        listing_type="SALE",
        price=7500000,
        bhk=3,
        bathrooms=2,
        area_sqft=1200,
        is_published=True,
        created_by=admin.id
    )

    private_listing = Property(
        title="Private Test Kolkata Home",
        slug="private-demo",
        city="Kolkata",
        description="Hidden test property for auth checks.",
        property_type="HOUSE",
        price=9000000,
        bhk=4,
        bathrooms=3,
        area_sqft=2000,
        is_published=False
    )

    db.add_all([listing, private_listing])
    db.commit()

    def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db

    with TestClient(app) as client:
        yield (
            db, client, admin,
            agent, other_agent, listing
        )

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(engine)
    engine.dispose()


def login(client, email, password):
    result = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password
        }
    )

    assert result.status_code == 200, result.text

    return {
        "X-CSRF-Token": client.cookies.get(
            "qevn_csrf"
        )
    }
