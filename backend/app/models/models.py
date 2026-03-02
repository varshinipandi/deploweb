from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    admin = "Admin"
    core_team = "Core Team"
    member = "Member"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.member)
    domain = Column(String(100))
    experience = Column(String(100))
    skills = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    posts = relationship("Post", back_populates="author")
    leaderboard = relationship("LeaderboardEntry", back_populates="user", uselist=False)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    difficulty = Column(String(50))
    tags = Column(JSON, default=list)
    prize = Column(String(100))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    participants = Column(JSON, default=list)

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    members = Column(JSON, default=list)
    compatibility_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_score = Column(Integer, default=0)
    events_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    upvotes_received = Column(Integer, default=0)
    hackathon_wins = Column(Integer, default=0)
    mentorship_sessions = Column(Integer, default=0)
    badges = Column(JSON, default=list)
    tier = Column(String(20), default="Bronze")
    user = relationship("User", back_populates="leaderboard")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    thread_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author = relationship("User", back_populates="posts")
    threat_analysis = relationship("ThreatAnalysisLog", back_populates="post", uselist=False)

class ThreatAnalysisLog(Base):
    __tablename__ = "threat_analysis_logs"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    threat_level = Column(String(20))
    threat_score = Column(Integer, default=0)
    patterns_found = Column(JSON, default=list)
    mitigation = Column(Text)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    post = relationship("Post", back_populates="threat_analysis")
