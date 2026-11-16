
import argparse
import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.tables import User


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--email", required=True
    )
    parser.add_argument(
        "--name", required=True
    )

    args = parser.parse_args()

    email = args.email.strip().lower()
    password = getpass.getpass(
        "Admin password (min 12 characters): "
    )

    if len(password) < 12:
        raise SystemExit(
            "Password must have at least 12 characters"
        )

    with SessionLocal() as db:
        existing = db.scalar(
            select(User.id).where(
                User.email == email
            )
        )

        if existing:
            raise SystemExit(
                "An account already exists with that email"
            )

        user = User(
            full_name=args.name,
            email=email,
            password_hash=hash_password(password),
            role="ADMIN"
        )

        db.add(user)
        db.commit()

    print("Admin created successfully.")


if __name__ == "__main__":
    main()
