
import io
import re
import uuid
from decimal import Decimal
from typing import Literal

from fastapi import (
    APIRouter, Depends, File, HTTPException,
    Query, UploadFile
)
from PIL import Image, UnidentifiedImageError
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import require_admin
from app.db.session import get_db
from app.models.tables import (
    Lead, Property, PropertyImage, SiteVisit, User
)
from app.schemas.dto import (
    PropertyAdminRead, PropertyIn,
    PropertyPatch, PropertyRead
)


public = APIRouter(
    prefix="/properties", tags=["Properties"]
)
admin = APIRouter(
    prefix="/admin/properties", tags=["Admin properties"]
)
settings = get_settings()


def filtered_query(
    city, keyword, min_price, max_price,
    property_type, listing_type, bhk
):
    conditions = [Property.is_published.is_(True)]

    if city:
        conditions.append(
            Property.city.ilike(f"%{city}%")
        )
    if keyword:
        conditions.append(
            or_(
                Property.title.ilike(f"%{keyword}%"),
                Property.locality.ilike(f"%{keyword}%")
            )
        )
    if min_price is not None:
        conditions.append(Property.price >= min_price)
    if max_price is not None:
        conditions.append(Property.price <= max_price)
    if property_type:
        conditions.append(
            Property.property_type == property_type
        )
    if listing_type:
        conditions.append(
            Property.listing_type == listing_type
        )
    if bhk is not None:
        conditions.append(Property.bhk == bhk)

    return conditions


@public.get("")
def list_properties(
    db: Session = Depends(get_db),
    city: str | None = None,
    keyword: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    property_type: str | None = None,
    listing_type: str | None = None,
    bhk: int | None = Query(default=None, ge=0, le=20),
    sort: Literal[
        "newest", "price_asc", "price_desc"
    ] = "newest",
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=50)
):
    conditions = filtered_query(
        city, keyword, min_price, max_price,
        property_type, listing_type, bhk
    )

    total = db.scalar(
        select(func.count())
        .select_from(Property)
        .where(*conditions)
    ) or 0

    sorting = {
        "newest": (
            Property.created_at.desc(),
            Property.id.desc()
        ),
        "price_asc": (
            Property.price.asc(),
            Property.id.asc()
        ),
        "price_desc": (
            Property.price.desc(),
            Property.id.asc()
        )
    }[sort]

    items = db.scalars(
        select(Property)
        .where(*conditions)
        .order_by(*sorting)
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    return {
        "items": [
            PropertyRead.model_validate(i)
            .model_dump(mode="json")
            for i in items
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


@public.get("/{slug}", response_model=PropertyRead)
def property_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    prop = db.scalar(
        select(Property).where(
            Property.slug == slug,
            Property.is_published.is_(True)
        )
    )

    if prop is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    return prop


@admin.get("")
def all_properties(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50)
):
    total = db.scalar(
        select(func.count()).select_from(Property)
    ) or 0

    items = db.scalars(
        select(Property)
        .order_by(
            Property.created_at.desc(),
            Property.id.desc()
        )
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    return {
        "items": [
            PropertyAdminRead.model_validate(i)
            .model_dump(mode="json")
            for i in items
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


def make_slug(title: str, db: Session) -> str:
    root = (
        re.sub(r"[^a-z0-9]+", "-", title.lower())
        .strip("-")[:130]
        or "property"
    )

    slug = root

    while db.scalar(
        select(Property.id).where(Property.slug == slug)
    ):
        slug = f"{root}-{uuid.uuid4().hex[:8]}"

    return slug


@admin.post(
    "", response_model=PropertyAdminRead,
    status_code=201
)
def create_property(
    payload: PropertyIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    record = Property(
        **payload.model_dump(),
        slug=make_slug(payload.title, db),
        created_by=user.id
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@admin.patch(
    "/{property_id}",
    response_model=PropertyAdminRead
)
def update_property(
    property_id: str,
    payload: PropertyPatch,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    record = db.get(Property, property_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    for k, v in payload.model_dump(
        exclude_unset=True
    ).items():
        if v is None and k not in (
            "latitude", "longitude"
        ):
            raise HTTPException(
                status_code=422,
                detail=f"{k} cannot be null"
            )

        setattr(record, k, v)

    db.commit()
    db.refresh(record)
    return record


@admin.delete("/{property_id}")
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    record = db.get(Property, property_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    has_lead = db.scalar(
        select(Lead.id)
        .where(Lead.property_id == property_id)
        .limit(1)
    )
    has_visit = db.scalar(
        select(SiteVisit.id)
        .where(SiteVisit.property_id == property_id)
        .limit(1)
    )

    if has_lead or has_visit:
        raise HTTPException(
            status_code=409,
            detail="Property has customer activity; unpublish instead"
        )

    if record.images:
        raise HTTPException(
            status_code=409,
            detail="Delete property images first"
        )

    db.delete(record)
    db.commit()
    return {"success": True}


def configure_cloudinary():
    if not all([
        settings.cloudinary_cloud_name,
        settings.cloudinary_api_key,
        settings.cloudinary_api_secret
    ]):
        raise HTTPException(
            status_code=503,
            detail="Image service not configured"
        )

    import cloudinary

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True
    )


@admin.post("/{property_id}/images", status_code=201)
def upload_image(
    property_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    prop = db.get(Property, property_id)

    if not prop:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    if file.content_type not in (
        "image/jpeg", "image/png", "image/webp"
    ):
        raise HTTPException(
            status_code=422,
            detail="Allowed: JPEG, PNG, WEBP"
        )

    content = file.file.read(5 * 1024 * 1024 + 1)

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Max 5 MB"
        )

    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, ValueError, OSError):
        raise HTTPException(
            status_code=422,
            detail="Invalid image"
        ) from None

    configure_cloudinary()
    import cloudinary.uploader

    public_id = f"qevn/properties/{uuid.uuid4().hex}"

    try:
        saved = cloudinary.uploader.upload(
            io.BytesIO(content),
            public_id=public_id,
            resource_type="image",
            overwrite=False
        )

        record = PropertyImage(
            property_id=property_id,
            storage_public_id=saved["public_id"],
            image_url=saved["secure_url"],
            alt_text=prop.title,
            is_cover=not bool(prop.images)
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "image_url": record.image_url,
            "is_cover": record.is_cover
        }

    except Exception:
        db.rollback()

        try:
            cloudinary.uploader.destroy(
                public_id,
                resource_type="image"
            )
        except Exception:
            pass

        raise HTTPException(
            status_code=502,
            detail="Image upload failed"
        ) from None


@admin.delete(
    "/{property_id}/images/{image_id}"
)
def delete_image(
    property_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    record = db.scalar(
        select(PropertyImage).where(
            PropertyImage.id == image_id,
            PropertyImage.property_id == property_id
        )
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    configure_cloudinary()
    import cloudinary.uploader

    try:
        deleted = cloudinary.uploader.destroy(
            record.storage_public_id,
            resource_type="image"
        )

        if deleted.get("result") not in (
            "ok", "not found"
        ):
            raise RuntimeError(
                "Cloudinary deletion not acknowledged"
            )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Image storage deletion failed"
        ) from None

    db.delete(record)
    db.commit()
    return {"success": True}
