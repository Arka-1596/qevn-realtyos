
from fastapi import HTTPException

from app.models.tables import Lead, User


def can_access_lead(user: User, lead: Lead):
    if (
        user.role != "ADMIN"
        and lead.assigned_agent_id != user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not assigned to this lead"
        )
