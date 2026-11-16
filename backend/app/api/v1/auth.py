
from fastapi import (
    APIRouter, Depends, HTTPException,
    Request, Response
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limits import throttle
from app.core.security import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    current_user,
    get_auth_session,
    new_session,
    require_csrf_if_write,
    verify_password
)
from app.db.session import get_db
from app.models.tables import AuthSession, User
from app.schemas.dto import LoginIn, UserRead


router = APIRouter(prefix="/auth", tags=["Auth"])
settings = get_settings()


@router.post("/login", response_model=UserRead)
def login(
    request: Request,
    payload: LoginIn,
    response: Response,
    db: Session = Depends(get_db)
):
    throttle(request, "login", 5, 60)

    user = db.scalar(
        select(User).where(
            User.email == str(payload.email).strip().lower()
        )
    )

    if (
        user is None
        or not user.is_active
        or not verify_password(
            payload.password, user.password_hash
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token, csrf = new_session(db, user)

    response.set_cookie(
        SESSION_COOKIE,
        token,
        secure=settings.cookie_secure,
        httponly=True,
        samesite="lax",
        max_age=12 * 3600,
        path="/"
    )

    response.set_cookie(
        CSRF_COOKIE,
        csrf,
        secure=settings.cookie_secure,
        httponly=False,
        samesite="lax",
        max_age=12 * 3600,
        path="/"
    )

    return user


@router.post("/logout")
def logout(
    response: Response,
    session: AuthSession = Depends(get_auth_session),
    db: Session = Depends(get_db),
    _: None = Depends(require_csrf_if_write)
):
    db.delete(session)
    db.commit()

    response.delete_cookie(SESSION_COOKIE, path="/")
    response.delete_cookie(CSRF_COOKIE, path="/")

    return {"success": True}


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(current_user)):
    return user
