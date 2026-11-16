
import argparse
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.tables import Property, User


DEMO_PROPERTIES = [
    (
        "DEMO New Town 3BHK Apartment",
        "Kolkata", "New Town",
        "APARTMENT", 3, "7500000"
    ),
    (
        "DEMO Salt Lake 2BHK Apartment",
        "Kolkata", "Salt Lake",
        "APARTMENT", 2, "5800000"
    ),
    (
        "DEMO Rajarhat Family House",
        "Kolkata", "Rajarhat",
        "HOUSE", 4, "12000000"
    ),
    (
        "DEMO Howrah Studio Apartment",
        "Howrah", "Shibpur",
        "APARTMENT", 1, "2300000"
    ),
    (
        "DEMO Ballygunge 3BHK Apartment",
        "Kolkata", "Ballygunge",
        "APARTMENT", 3, "14500000"
    ),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--admin-email", required=True
    )
    args = parser.parse_args()

    with SessionLocal() as db:
        admin = db.scalar(
            select(User).where(
                User.email == args.admin_email.lower(),
                User.role == "ADMIN"
            )
        )

        if not admin:
            raise SystemExit(
                "Create an Admin with this email first"
            )

        created = 0

        for idx, (
            title, city, locality, kind, bhk, price
        ) in enumerate(DEMO_PROPERTIES, 1):

            slug = f"demo-qevn-{idx}"

            existing = db.scalar(
                select(Property.id).where(
                    Property.slug == slug
                )
            )

            if existing:
                continue

            db.add(
                Property(
                    slug=slug,
                    title=title,
                    description=(
                        "Fictional demonstration listing "
                        "for the QEVN RealtyOS assessment. "
                        "Not a real property offer."
                    ),
                    city=city,
                    locality=locality,
                    property_type=kind,
                    listing_type="SALE",
                    price=Decimal(price),
                    bhk=bhk,
                    bathrooms=max(1, bhk),
                    area_sqft=Decimal(
                        450 + bhk * 310
                    ),
                    is_published=True,
                    created_by=admin.id
                )
            )

            created += 1

        db.commit()

    print(
        f"Added {created} fictional demo listings"
    )


if __name__ == "__main__":
    main()
