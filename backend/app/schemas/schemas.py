from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional, Any
from datetime import datetime

# ── Auth ────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: List[str] = []
    domain: Optional[str] = None
    experience: Optional[str] = None

    @field_validator("password")
    @classmethod
    def strong_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v):
        return v.strip()[:120]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    domain: Optional[str]
    experience: Optional[str]
    skills: List[str] = []
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ── Events ────────────────────────────────────────────
class EventCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    tags: List[str] = []
    prize: Optional[str] = None
    start_date: datetime
    end_date: datetime

class EventOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    tags: List[str]
    prize: Optional[str]
    start_date: datetime
    end_date: datetime
    is_active: bool
    participants: List[Any] = []

    class Config:
        from_attributes = True

# ── Teams ─────────────────────────────────────────────
class TeamCreate(BaseModel):
    name: str
    event_id: Optional[int] = None
    member_ids: List[int] = []

class CompatibilityRequest(BaseModel):
    member_ids: List[int]

class CompatibilityResult(BaseModel):
    final_score: float
    domain_coverage: dict
    balance_score: float
    diversity_score: float
    total_skills: int
    suggestion: str

class TeamOut(BaseModel):
    id: int
    name: str
    members: List[Any]
    compatibility_score: float

    class Config:
        from_attributes = True

# ── Leaderboard ───────────────────────────────────────
class LeaderboardEntryOut(BaseModel):
    user_id: int
    name: str
    domain: Optional[str]
    total_score: int
    tier: str
    badges: List[str]
    events_count: int
    posts_count: int
    hackathon_wins: int

# ── Feed ──────────────────────────────────────────────
class PostCreate(BaseModel):
    content: str
    code_snippet: Optional[str] = None
    thread_id: Optional[int] = None

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v):
        # Basic HTML escape
        return v.replace("<", "&lt;").replace(">", "&gt;")[:5000]

class PostOut(BaseModel):
    id: int
    content: str
    code_snippet: Optional[str]
    upvotes: int
    downvotes: int
    created_at: datetime

    class Config:
        from_attributes = True

# ── Threat ────────────────────────────────────────────
class ThreatResult(BaseModel):
    threat_level: str
    threat_score: int
    patterns_found: List[str]
    mitigation: str
