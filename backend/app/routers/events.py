from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import Event, User, LeaderboardEntry
from app.schemas.schemas import EventCreate, EventOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=list[EventOut])
async def list_events(
    tag: str | None = None,
    difficulty: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Event).where(Event.is_active == True)
    result = await db.execute(query)
    events = result.scalars().all()
    if tag:
        events = [e for e in events if tag in (e.tags or [])]
    if difficulty:
        events = [e for e in events if e.difficulty == difficulty]
    return events

@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/")
async def create_event(body: EventCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role.value not in ["Admin", "Core Team"]:
        raise HTTPException(status_code=403, detail="Only admins can create events")
    event = Event(**body.model_dump(), created_by=current_user.id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.post("/{event_id}/register")
async def register_event(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    participants = event.participants or []
    if current_user.id in participants:
        raise HTTPException(status_code=400, detail="Already registered")
    participants.append(current_user.id)
    event.participants = participants
    # Update leaderboard
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == current_user.id))
    lb = lb_result.scalar_one_or_none()
    if lb:
        lb.events_count += 1
    await db.commit()
    return {"message": "Registered successfully", "total_participants": len(participants)}
