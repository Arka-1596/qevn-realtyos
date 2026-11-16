
import hashlib
import secrets
from datetime import timedelta

from argon2 import PasswordHasher
from argon2.exceptions import (
    VerifyMismatchError, VerificationError
)
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.tables import AuthSession, User, utcnow


password_hasher = PasswordHasher()

SESSION_COOKIE = "qevn_session"
CSRF_COOKIE = "qevn_csrf"
AI_COOKIE = "qevn_ai_session"


def digest(value: str) -> str:
    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, stored: str) -> bool:
    try:
        return password_hasher.verify(stored, password)
    except (VerifyMismatchError, VerificationError):
        return False


def new_session(db: Session, user: User):
    token = secrets.token_urlsafe(48)
    csrf = secrets.token_urlsafe(32)

    entry = AuthSession(
        user_id=user.id,
        token_hash=digest(token),
        csrf_token=csrf,
        expires_at=utcnow() + timedelta(hours=12)
    )

    db.add(entry)
    user.last_login_at = utcnow()
    db.commit()

    return token, csrf


def get_auth_session(
    request: Request,
    db: Session = Depends(get_db)
) -> AuthSession:
    token = request.cookies.get(SESSION_COOKIE)

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    session = db.scalar(
        select(AuthSession).where(
            AuthSession.token_hash == digest(token)
        )
    )

    if (
        session is None
        or session.expires_at.replace(tzinfo=None)
        <= utcnow().replace(tzinfo=None)
    ):
        raise HTTPException(
            status_code=401,
            detail="Session expired or invalid"
        )

    return session


def current_user(
    session: AuthSession = Depends(get_auth_session)
) -> User:
    if not session.user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account inactive"
        )
    return session.user


def require_csrf_if_write(
    request: Request,
    session: AuthSession = Depends(get_auth_session)
):
    if (
        request.method not in ("GET", "HEAD", "OPTIONS")
        and not secrets.compare_digest(
            request.headers.get("X-CSRF-Token", ""),
            session.csrf_token
        )
    ):
        raise HTTPException(
            status_code=403,
            detail="Missing or invalid CSRF token"
        )


def require_admin(
    user: User = Depends(current_user),
    _: None = Depends(require_csrf_if_write)
) -> User:
    if user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


def require_agent_or_admin(
    user: User = Depends(current_user),
    _: None = Depends(require_csrf_if_write)
) -> User:
    if user.role not in ("ADMIN", "AGENT"):
        raise HTTPException(
            status_code=403,
            detail="Staff access required"
        )
    return user
