from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import Team, User
from app.schemas.schemas import TeamCreate, CompatibilityRequest
from app.services.auth_service import get_current_user
from app.ai.team_compatibility import compute_compatibility

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/")
async def list_teams(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team))
    return result.scalars().all()

@router.post("/")
async def create_team(body: TeamCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    team = Team(name=body.name, event_id=body.event_id, members=body.member_ids)
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team

@router.post("/compatibility")
async def team_compatibility(body: CompatibilityRequest, db: AsyncSession = Depends(get_db)):
    members = []
    for uid in body.member_ids:
        result = await db.execute(select(User).where(User.id == uid))
        user = result.scalar_one_or_none()
        if user:
            members.append({"id": user.id, "name": user.name, "skills": user.skills or [], "domain": user.domain})
    if len(members) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid members required")
    return compute_compatibility(members)
