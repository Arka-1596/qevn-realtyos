
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Index,
    Integer, Numeric, String, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(12), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow, onupdate=utcnow
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True
    )
    csrf_token: Mapped[str] = mapped_column(String(80))
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True)
    )
    user: Mapped[User] = relationship()


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    slug: Mapped[str] = mapped_column(
        String(200), unique=True, index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(100), index=True)
    locality: Mapped[str] = mapped_column(
        String(100), default=""
    )
    address: Mapped[str] = mapped_column(
        String(255), default=""
    )
    state: Mapped[str] = mapped_column(
        String(100), default="West Bengal"
    )
    country: Mapped[str] = mapped_column(
        String(100), default="India"
    )
    latitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6)
    )
    longitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6)
    )
    property_type: Mapped[str] = mapped_column(
        String(30), index=True
    )
    listing_type: Mapped[str] = mapped_column(
        String(10), default="SALE"
    )
    price: Mapped[float] = mapped_column(
        Numeric(15, 2), index=True
    )
    currency: Mapped[str] = mapped_column(
        String(3), default="INR"
    )
    bhk: Mapped[int] = mapped_column(
        Integer, default=0, index=True
    )
    bathrooms: Mapped[int] = mapped_column(
        Integer, default=0
    )
    area_sqft: Mapped[float] = mapped_column(
        Numeric(12, 2)
    )
    furnished_status: Mapped[str] = mapped_column(
        String(25), default="UNFURNISHED"
    )
    availability_status: Mapped[str] = mapped_column(
        String(25), default="AVAILABLE"
    )
    is_featured: Mapped[bool] = mapped_column(
        Boolean, default=False
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, default=False, index=True
    )
    created_by: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow, onupdate=utcnow
    )

    images: Mapped[list["PropertyImage"]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    __table_args__ = (
        Index(
            "ix_properties_search",
            "is_published", "city", "bhk", "price"
        ),
    )


class PropertyImage(Base):
    __tablename__ = "property_images"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    property_id: Mapped[str] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"),
        index=True
    )
    storage_public_id: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str] = mapped_column(Text)
    alt_text: Mapped[str] = mapped_column(
        String(250), default=""
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, default=0
    )
    is_cover: Mapped[bool] = mapped_column(
        Boolean, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )

    property: Mapped[Property] = relationship(
        back_populates="images"
    )


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(
        String(255), index=True
    )
    phone: Mapped[str] = mapped_column(String(25))
    property_id: Mapped[str | None] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL")
    )
    source: Mapped[str] = mapped_column(
        String(30), default="WEBSITE"
    )
    status: Mapped[str] = mapped_column(
        String(30), default="NEW", index=True
    )
    assigned_agent_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True
    )
    budget_min: Mapped[float | None] = mapped_column(
        Numeric(15, 2)
    )
    budget_max: Mapped[float | None] = mapped_column(
        Numeric(15, 2)
    )
    preferred_city: Mapped[str | None] = mapped_column(
        String(100)
    )
    preferred_bhk: Mapped[int | None] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text, default="")
    next_follow_up_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow, onupdate=utcnow
    )


class LeadNote(Base):
    __tablename__ = "lead_notes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    lead_id: Mapped[str] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        index=True
    )
    author_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT")
    )
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )


class LeadActivity(Base):
    __tablename__ = "lead_activity"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    lead_id: Mapped[str] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        index=True
    )
    actor_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    action_type: Mapped[str] = mapped_column(String(50))
    previous_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )


class SiteVisit(Base):
    __tablename__ = "site_visits"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    property_id: Mapped[str] = mapped_column(
        ForeignKey("properties.id", ondelete="RESTRICT"),
        index=True
    )
    lead_id: Mapped[str] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        index=True
    )
    assigned_agent_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True
    )
    preferred_start_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True)
    )
    confirmed_start_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    status: Mapped[str] = mapped_column(
        String(20), default="REQUESTED", index=True
    )
    customer_notes: Mapped[str] = mapped_column(
        Text, default=""
    )
    agent_notes: Mapped[str] = mapped_column(
        Text, default=""
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow, onupdate=utcnow
    )


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    anonymous_session_hash: Mapped[str] = mapped_column(
        String(64), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow, onupdate=utcnow
    )


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey(
            "ai_conversations.id",
            ondelete="CASCADE"
        ),
        index=True
    )
    role: Mapped[str] = mapped_column(String(15))
    content: Mapped[str] = mapped_column(Text)
    tool_name: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )


class PendingAIAction(Base):
    __tablename__ = "pending_ai_actions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=new_id
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True
    )
    session_hash: Mapped[str] = mapped_column(
        String(64), index=True
    )
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey(
            "ai_conversations.id",
            ondelete="CASCADE"
        )
    )
    action_type: Mapped[str] = mapped_column(String(30))
    payload_json: Mapped[str] = mapped_column(Text)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True)
    )
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
