
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1 import (
    admin, ai, auth, leads,
    properties, visits
)
from app.core.config import get_settings
from app.db.session import engine


settings = get_settings()

app = FastAPI(
    title="QEVN RealtyOS API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=[
        "GET", "POST", "PATCH", "DELETE"
    ],
    allow_headers=[
        "Content-Type",
        "X-CSRF-Token",
        "X-Request-ID"
    ]
)


@app.middleware("http")
async def request_guard(
    request: Request,
    call_next
):
    if request.method not in (
        "GET", "HEAD", "OPTIONS"
    ):
        origin = request.headers.get("origin")

        if (
            origin
            and origin not in settings.allowed_origins
        ):
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "Untrusted request origin"
                }
            )

    response = await call_next(request)

    response.headers["X-Request-ID"] = (
        request.headers.get(
            "X-Request-ID",
            str(uuid.uuid4())
        )[:80]
    )

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = (
        "strict-origin-when-cross-origin"
    )

    return response


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "qevn-realtyos"
    }


@app.get("/ready", tags=["Health"])
def ready():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {"status": "ready"}

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        ) from None


for router in (
    auth.router,
    properties.public,
    properties.admin,
    leads.public,
    leads.admin,
    leads.agent,
    visits.public,
    visits.admin,
    visits.agent,
    admin.router,
    ai.router
):
    app.include_router(
        router,
        prefix="/api/v1"
    )
