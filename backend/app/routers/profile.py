from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import User, LeaderboardEntry, Post
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

LEARNING_ROADMAPS = {
    "AI / Machine Learning": [
        {"step": 1, "title": "Adversarial ML Fundamentals", "status": "complete"},
        {"step": 2, "title": "Model Security & Privacy", "status": "active"},
        {"step": 3, "title": "Federated Learning Security", "status": "locked"},
        {"step": 4, "title": "LLM Red Teaming", "status": "locked"},
    ],
    "Cybersecurity": [
        {"step": 1, "title": "Web Application Security (OWASP)", "status": "complete"},
        {"step": 2, "title": "Network Penetration Testing", "status": "active"},
        {"step": 3, "title": "Malware Analysis & Reverse Engineering", "status": "locked"},
        {"step": 4, "title": "Red Team Operations", "status": "locked"},
    ],
    "Full Stack Development": [
        {"step": 1, "title": "Secure API Design", "status": "complete"},
        {"step": 2, "title": "Authentication & Authorization Patterns", "status": "active"},
        {"step": 3, "title": "DevSecOps Pipelines", "status": "locked"},
        {"step": 4, "title": "Cloud Security Architecture", "status": "locked"},
    ],
}

@router.get("/{user_id}")
async def get_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    lb_res = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == user_id))
    lb = lb_res.scalar_one_or_none()
    return {
        "id": user.id, "name": user.name, "email": user.email, "domain": user.domain,
        "experience": user.experience, "skills": user.skills, "role": user.role.value,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "leaderboard": {
            "score": (lb.events_count * 10 + lb.posts_count * 5 + lb.upvotes_received * 3 + lb.hackathon_wins * 50 + lb.mentorship_sessions * 20) if lb else 0,
            "badges": lb.badges if lb else [],
        }
    }

@router.put("/me")
async def update_profile(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    allowed = ["name", "domain", "experience", "skills"]
    for key in allowed:
        if key in body:
            setattr(current_user, key, body[key])
    await db.commit()
    return {"message": "Profile updated"}

@router.get("/{user_id}/roadmap")
async def learning_roadmap(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    roadmap = LEARNING_ROADMAPS.get(user.domain or "", LEARNING_ROADMAPS["Cybersecurity"])
    return {"domain": user.domain, "roadmap": roadmap}
