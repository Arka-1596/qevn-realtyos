
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Annotated

from pydantic import (
    BaseModel, ConfigDict, EmailStr, Field,
    field_validator, model_validator
)


class Role(str, Enum):
    ADMIN = "ADMIN"
    AGENT = "AGENT"


class LeadStatus(str, Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    VISIT_SCHEDULED = "VISIT_SCHEDULED"
    NEGOTIATION = "NEGOTIATION"
    WON = "WON"
    LOST = "LOST"


class VisitStatus(str, Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


Money = Annotated[
    Decimal, Field(ge=0, max_digits=15, decimal_places=2)
]
Phone = Annotated[
    str,
    Field(
        min_length=7, max_length=20,
        pattern=r"^\+?[0-9 ()-]+$"
    )
]


class ORMResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ImageRead(ORMResponse):
    id: str
    image_url: str
    alt_text: str
    sort_order: int
    is_cover: bool


class PropertyIn(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10, max_length=10000)
    city: str = Field(min_length=2, max_length=100)
    locality: str = Field(default="", max_length=100)
    address: str = Field(default="", max_length=255)
    state: str = "West Bengal"
    country: str = "India"
    latitude: Decimal | None = Field(
        default=None, ge=-90, le=90
    )
    longitude: Decimal | None = Field(
        default=None, ge=-180, le=180
    )
    property_type: str = Field(
        pattern=r"^(APARTMENT|HOUSE|VILLA|LAND|COMMERCIAL)$"
    )
    listing_type: str = Field(
        default="SALE", pattern=r"^(SALE|RENT)$"
    )
    price: Money
    currency: str = Field(
        default="INR", pattern=r"^[A-Z]{3}$"
    )
    bhk: int = Field(ge=0, le=20)
    bathrooms: int = Field(ge=0, le=30)
    area_sqft: Decimal = Field(gt=0)
    furnished_status: str = Field(
        default="UNFURNISHED",
        pattern=r"^(FURNISHED|SEMI_FURNISHED|UNFURNISHED)$"
    )
    availability_status: str = Field(
        default="AVAILABLE",
        pattern=r"^(AVAILABLE|SOLD|RENTED|UNAVAILABLE)$"
    )
    is_featured: bool = False
    is_published: bool = False


class PropertyPatch(BaseModel):
    title: str | None = Field(
        default=None, min_length=5, max_length=200
    )
    description: str | None = Field(
        default=None, min_length=10, max_length=10000
    )
    city: str | None = Field(
        default=None, min_length=2, max_length=100
    )
    locality: str | None = Field(
        default=None, max_length=100
    )
    address: str | None = Field(
        default=None, max_length=255
    )
    state: str | None = Field(
        default=None, max_length=100
    )
    country: str | None = Field(
        default=None, max_length=100
    )
    latitude: Decimal | None = Field(
        default=None, ge=-90, le=90
    )
    longitude: Decimal | None = Field(
        default=None, ge=-180, le=180
    )
    property_type: str | None = Field(
        default=None,
        pattern=r"^(APARTMENT|HOUSE|VILLA|LAND|COMMERCIAL)$"
    )
    listing_type: str | None = Field(
        default=None, pattern=r"^(SALE|RENT)$"
    )
    price: Money | None = None
    currency: str | None = Field(
        default=None, pattern=r"^[A-Z]{3}$"
    )
    bhk: int | None = Field(default=None, ge=0, le=20)
    bathrooms: int | None = Field(
        default=None, ge=0, le=30
    )
    area_sqft: Decimal | None = Field(default=None, gt=0)
    furnished_status: str | None = Field(
        default=None,
        pattern=r"^(FURNISHED|SEMI_FURNISHED|UNFURNISHED)$"
    )
    availability_status: str | None = Field(
        default=None,
        pattern=r"^(AVAILABLE|SOLD|RENTED|UNAVAILABLE)$"
    )
    is_featured: bool | None = None
    is_published: bool | None = None


class PropertyRead(ORMResponse):
    id: str
    slug: str
    title: str
    description: str
    city: str
    locality: str
    state: str
    country: str
    latitude: Decimal | None
    longitude: Decimal | None
    property_type: str
    listing_type: str
    price: Decimal
    currency: str
    bhk: int
    bathrooms: int
    area_sqft: Decimal
    furnished_status: str
    availability_status: str
    is_featured: bool
    images: list[ImageRead] = Field(default_factory=list)


class PropertyAdminRead(PropertyRead):
    address: str
    is_published: bool
    created_by: str | None


class LeadIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Phone
    property_id: str | None = None
    message: str = Field(default="", max_length=2000)
    budget_min: Money | None = None
    budget_max: Money | None = None
    preferred_city: str | None = Field(
        default=None, max_length=100
    )
    preferred_bhk: int | None = Field(
        default=None, ge=0, le=20
    )

    @model_validator(mode="after")
    def check_budget(self):
        if (
            self.budget_min is not None
            and self.budget_max is not None
            and self.budget_min > self.budget_max
        ):
            raise ValueError(
                "budget_min cannot exceed budget_max"
            )
        return self


class LeadPatch(BaseModel):
    status: LeadStatus | None = None
    assigned_agent_id: str | None = None
    next_follow_up_at: datetime | None = None


class AgentLeadPatch(BaseModel):
    status: LeadStatus | None = None
    next_follow_up_at: datetime | None = None


class LeadRead(ORMResponse):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    property_id: str | None
    source: str
    status: str
    assigned_agent_id: str | None
    message: str
    next_follow_up_at: datetime | None
    created_at: datetime


class LeadCreated(BaseModel):
    id: str
    status: str
    success: bool = True


class NoteIn(BaseModel):
    content: str = Field(min_length=1, max_length=3000)


class NoteRead(ORMResponse):
    id: str
    lead_id: str
    author_id: str
    content: str
    created_at: datetime


class VisitIn(BaseModel):
    property_id: str
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Phone
    preferred_start_at: datetime
    customer_notes: str = Field(
        default="", max_length=2000
    )

    @field_validator("preferred_start_at")
    @classmethod
    def future_time(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            raise ValueError(
                "Provide datetime with time zone offset"
            )
        if v <= datetime.now(timezone.utc):
            raise ValueError(
                "Visit time must be in the future"
            )
        return v.astimezone(timezone.utc)


class VisitPatch(BaseModel):
    status: VisitStatus
    confirmed_start_at: datetime | None = None
    assigned_agent_id: str | None = None
    agent_notes: str | None = Field(
        default=None, max_length=2000
    )


class VisitRead(ORMResponse):
    id: str
    property_id: str
    lead_id: str
    assigned_agent_id: str | None
    preferred_start_at: datetime
    confirmed_start_at: datetime | None
    status: str
    customer_notes: str
    agent_notes: str


class AgentIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class AgentPatch(BaseModel):
    full_name: str | None = Field(
        default=None, min_length=2, max_length=120
    )
    is_active: bool | None = None


class UserRead(ORMResponse):
    id: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AIChatIn(BaseModel):
    conversation_id: str | None = None
    message: str = Field(min_length=1, max_length=1500)


class AIConfirmIn(BaseModel):
    confirmation_ref: str = Field(min_length=30)
