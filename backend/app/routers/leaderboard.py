from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
import json
from app.database import get_db
from app.models.models import LeaderboardEntry, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

def calc_score(lb: LeaderboardEntry) -> int:
    return (
        lb.events_count * 10
        + lb.posts_count * 5
        + lb.upvotes_received * 3
        + lb.hackathon_wins * 50
        + lb.mentorship_sessions * 20
    )

def get_tier(score: int) -> str:
    if score >= 1000: return "Platinum"
    if score >= 500: return "Gold"
    if score >= 200: return "Silver"
    return "Bronze"

@router.get("/")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LeaderboardEntry, User).join(User, LeaderboardEntry.user_id == User.id)
    )
    rows = result.all()
    entries = []
    for lb, user in rows:
        score = calc_score(lb)
        tier = get_tier(score)
        entries.append({
            "user_id": user.id,
            "name": user.name,
            "domain": user.domain,
            "total_score": score,
            "tier": tier,
            "badges": lb.badges,
            "events_count": lb.events_count,
            "posts_count": lb.posts_count,
            "hackathon_wins": lb.hackathon_wins,
        })
    return sorted(entries, key=lambda x: x["total_score"], reverse=True)

@router.get("/me")
async def my_rank(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == current_user.id))
    lb = result.scalar_one_or_none()
    if not lb:
        raise HTTPException(status_code=404, detail="No leaderboard entry found")
    score = calc_score(lb)
    return {"user_id": current_user.id, "score": score, "tier": get_tier(score), "badges": lb.badges}

@router.websocket("/ws")
async def leaderboard_ws(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            result = await db.execute(
                select(LeaderboardEntry, User).join(User, LeaderboardEntry.user_id == User.id)
            )
            rows = result.all()
            entries = []
            for lb, user in rows:
                score = calc_score(lb)
                entries.append({
                    "user_id": user.id,
                    "name": user.name,
                    "total_score": score,
                    "tier": get_tier(score),
                })
            entries.sort(key=lambda x: x["total_score"], reverse=True)
            await websocket.send_text(json.dumps({"type": "leaderboard_update", "data": entries}))
            import asyncio
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
