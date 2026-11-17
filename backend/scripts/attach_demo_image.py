
import argparse
from pathlib import Path

import cloudinary
import cloudinary.uploader
from PIL import Image
from sqlalchemy import func, select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.tables import Property, PropertyImage


def main():
    parser = argparse.ArgumentParser(
        description="Attach a licensed demo image to a listing"
    )
    parser.add_argument("--slug", required=True)
    parser.add_argument("--file", required=True)
    parser.add_argument("--alt", default="Illustrative property photograph")

    args = parser.parse_args()
    settings = get_settings()
    image_path = Path(args.file).expanduser().resolve()

    if not image_path.is_file():
        raise SystemExit("Image file does not exist")

    if image_path.suffix.lower() not in (
        ".jpg", ".jpeg", ".png", ".webp"
    ):
        raise SystemExit("Use JPEG, PNG or WebP")

    if image_path.stat().st_size > 5 * 1024 * 1024:
        raise SystemExit("Image exceeds 5 MB")

    with Image.open(image_path) as image:
        image.verify()

    if not all((
        settings.cloudinary_cloud_name,
        settings.cloudinary_api_key,
        settings.cloudinary_api_secret,
    )):
        raise SystemExit("Cloudinary credentials are missing")

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )

    with SessionLocal() as db:
        property_record = db.scalar(
            select(Property).where(Property.slug == args.slug)
        )

        if property_record is None:
            raise SystemExit("Property slug not found")

        uploaded = cloudinary.uploader.upload(
            str(image_path),
            folder="qevn/realtyos-demo",
            resource_type="image",
            overwrite=False,
        )

        existing_count = db.scalar(
            select(func.count())
            .select_from(PropertyImage)
            .where(PropertyImage.property_id == property_record.id)
        ) or 0

        db.add(
            PropertyImage(
                property_id=property_record.id,
                storage_public_id=uploaded["public_id"],
                image_url=uploaded["secure_url"],
                alt_text=args.alt[:250],
                sort_order=existing_count,
                is_cover=existing_count == 0,
            )
        )

        try:
            db.commit()
        except Exception:
            db.rollback()
            cloudinary.uploader.destroy(uploaded["public_id"])
            raise

        print("Image attached successfully")
        print("Property:", property_record.title)
        print("Cloudinary URL:", uploaded["secure_url"])


if __name__ == "__main__":
    main()
