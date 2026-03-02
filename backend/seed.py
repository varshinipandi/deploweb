"""
Digital HQ Seed Script
Populates the database with mock data for demo/hackathon purposes.
Run:  python seed.py
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# ── Import models ─────────────────────────────────────────────────────────────
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, AsyncSessionLocal, init_db
from app.models.models import User, Event, Team, LeaderboardEntry, Post, ThreatAnalysisLog
from app.services.auth_service import hash_password

# ── Seed Data ─────────────────────────────────────────────────────────────────
USERS = [
    dict(name="Arya Sharma",    email="arya@hq.dev",    password="hq123456", domain="Cybersecurity",          experience="Advanced",      skills=["Python","Pen Testing","OWASP","CTF","Web Security","OSINT"]),
    dict(name="Ravi Nair",      email="ravi@hq.dev",    password="hq123456", domain="AI / Machine Learning",  experience="Advanced",      skills=["Python","ML","Deep Learning","PyTorch","NLP","Computer Vision"]),
    dict(name="Priya Mehta",    email="priya@hq.dev",   password="hq123456", domain="Full Stack Development", experience="Intermediate",  skills=["React","FastAPI","Docker","PostgreSQL","Redis","JavaScript"]),
    dict(name="Kiran Das",      email="kiran@hq.dev",   password="hq123456", domain="Data Science",           experience="Intermediate",  skills=["Python","Statistics","Data Science","ML","PostgreSQL"]),
    dict(name="Sana Qureshi",   email="sana@hq.dev",    password="hq123456", domain="Cybersecurity",          experience="Beginner",      skills=["Network Security","CTF","OSINT","Web Security"]),
    dict(name="Deepak Rao",     email="deepak@hq.dev",  password="hq123456", domain="Full Stack Development", experience="Intermediate",  skills=["React","JavaScript","Docker","FastAPI"]),
    dict(name="Meera Pillai",   email="meera@hq.dev",   password="hq123456", domain="AI / Machine Learning",  experience="Advanced",      skills=["Python","ML","Computer Vision","TensorFlow","Deep Learning"]),
    dict(name="Yash Trivedi",   email="yash@hq.dev",    password="hq123456", domain="Full Stack Development", experience="Beginner",      skills=["JavaScript","React","Docker"]),
    dict(name="Ananya Iyer",    email="ananya@hq.dev",  password="hq123456", domain="Cybersecurity",          experience="Advanced",      skills=["Pen Testing","Malware Analysis","Reverse Engineering","CTF"]),
    dict(name="Vikram Singh",   email="vikram@hq.dev",  password="hq123456", domain="AI / Machine Learning",  experience="Intermediate",  skills=["ML","NLP","Data Science","Python","Statistics"]),
    dict(name="Lakshmi Bose",   email="lakshmi@hq.dev", password="hq123456", domain="Cybersecurity",          experience="Intermediate",  skills=["OWASP","Web Security","Docker","FastAPI"]),
    dict(name="Rohan Gupta",    email="rohan@hq.dev",   password="hq123456", domain="Data Science",           experience="Beginner",      skills=["Python","Statistics","PostgreSQL"]),
    dict(name="Devi Krishnan",  email="devi@hq.dev",    password="hq123456", domain="AI / Machine Learning",  experience="Advanced",      skills=["PyTorch","Computer Vision","Deep Learning","NLP"]),
    dict(name="Farhan Ahmed",   email="farhan@hq.dev",  password="hq123456", domain="Full Stack Development", experience="Advanced",      skills=["React","FastAPI","Docker","Kubernetes","Redis"]),
    dict(name="Sneha Patel",    email="sneha@hq.dev",   password="hq123456", domain="Cybersecurity",          experience="Intermediate",  skills=["CTF","Web Security","OSINT","Network Security","Pen Testing"]),
]

LEADERBOARD_STATS = [
    dict(email="arya@hq.dev",    events=12, posts=45, upvotes=230, wins=3, mentorship=8,  badges=["Cyber Defender","Top Innovator"]),
    dict(email="ravi@hq.dev",    events=9,  posts=67, upvotes=189, wins=2, mentorship=5,  badges=["AI Architect"]),
    dict(email="priya@hq.dev",   events=15, posts=32, upvotes=143, wins=1, mentorship=12, badges=["Top Innovator"]),
    dict(email="kiran@hq.dev",   events=7,  posts=28, upvotes=95,  wins=0, mentorship=6,  badges=[]),
    dict(email="sana@hq.dev",    events=10, posts=21, upvotes=78,  wins=1, mentorship=3,  badges=["Cyber Defender"]),
    dict(email="deepak@hq.dev",  events=5,  posts=19, upvotes=56,  wins=0, mentorship=4,  badges=[]),
    dict(email="meera@hq.dev",   events=8,  posts=30, upvotes=110, wins=1, mentorship=2,  badges=["AI Architect"]),
    dict(email="yash@hq.dev",    events=6,  posts=15, upvotes=42,  wins=0, mentorship=1,  badges=[]),
    dict(email="ananya@hq.dev",  events=11, posts=38, upvotes=195, wins=2, mentorship=7,  badges=["Cyber Defender","CTF Master"]),
    dict(email="vikram@hq.dev",  events=4,  posts=22, upvotes=64,  wins=0, mentorship=3,  badges=[]),
    dict(email="lakshmi@hq.dev", events=7,  posts=25, upvotes=88,  wins=0, mentorship=5,  badges=["Cyber Defender"]),
    dict(email="rohan@hq.dev",   events=3,  posts=12, upvotes=31,  wins=0, mentorship=1,  badges=[]),
    dict(email="devi@hq.dev",    events=9,  posts=41, upvotes=156, wins=1, mentorship=4,  badges=["AI Architect","Top Innovator"]),
    dict(email="farhan@hq.dev",  events=14, posts=55, upvotes=210, wins=2, mentorship=9,  badges=["Top Innovator"]),
    dict(email="sneha@hq.dev",   events=8,  posts=20, upvotes=73,  wins=0, mentorship=2,  badges=["CTF Master"]),
]

now = datetime.utcnow()
EVENTS = [
    dict(title="HackAI 2026",                  description="Build AI-powered security tools in 48 hours. Open to all skill levels. $10K prize pool across 3 categories.",         difficulty="Intermediate", tags=["AI","Security","Hackathon"],      prize="$10,000",    start_date=now+timedelta(days=9),   end_date=now+timedelta(days=11)),
    dict(title="CyberCTF Spring",               description="50+ challenges across Web, Crypto, Forensics, Pwn, and OSINT categories. Solo or team of 2.",                        difficulty="Advanced",     tags=["CTF","Security","Crypto"],        prize="$3,000",     start_date=now+timedelta(days=19),  end_date=now+timedelta(days=20)),
    dict(title="ML Security Workshop",          description="Hands-on session covering adversarial attacks, model poisoning, and federated learning security. RSVP required.",    difficulty="Beginner",     tags=["Workshop","AI","Security"],       prize=None,         start_date=now+timedelta(days=14),  end_date=now+timedelta(days=14)),
    dict(title="Bug Bounty Sprint",             description="Find vulnerabilities in the HQ sandbox environment. Responsible disclosure required. Timed 24-hour event.",          difficulty="Advanced",     tags=["Bug Bounty","Security","Web"],    prize="$5,000",     start_date=now+timedelta(days=3),   end_date=now+timedelta(days=4)),
    dict(title="Web3 Security Bootcamp",        description="3-day deep dive into smart contract vulnerabilities, on-chain exploit analysis, and Solidity security patterns.",     difficulty="Intermediate", tags=["Web3","Smart Contracts","Audit"], prize="5 ETH",      start_date=now+timedelta(days=30),  end_date=now+timedelta(days=32)),
    dict(title="AI Red Team Exercise",          description="Community red teaming exercise targeting LLM-based systems. Jailbreak, prompt injection, exfiltration scenarios.",   difficulty="Advanced",     tags=["AI","Red Team","LLM"],            prize=None,         start_date=now+timedelta(days=5),   end_date=now+timedelta(days=5)),
    dict(title="Network Defense Challenge",     description="Blue team vs red team simulation. Defend your network infrastructure against live adversarial attacks.",              difficulty="Intermediate", tags=["Network","Defense","Blue Team"],  prize="$2,000",     start_date=now-timedelta(days=3),   end_date=now-timedelta(days=2)),
    dict(title="OSINT Masterclass",             description="Learn open-source intelligence gathering with real-world case studies. Tools: Maltego, Shodan, SpiderFoot.",         difficulty="Beginner",     tags=["OSINT","Recon","Security"],       prize=None,         start_date=now-timedelta(days=10),  end_date=now-timedelta(days=10)),
    dict(title="Federated Learning Summit",     description="Academic conference + coding challenge on privacy-preserving AI techniques. Joint event with 3 universities.",        difficulty="Advanced",     tags=["AI","Privacy","Research"],        prize="$1,500",     start_date=now+timedelta(days=45),  end_date=now+timedelta(days=46)),
    dict(title="Malware Reverse Engineering",   description="Analyze obfuscated malware samples using IDA Pro, Ghidra, and dynamic analysis sandboxes.",                          difficulty="Expert",       tags=["Malware","Reverse","CTF"],        prize="$1,000",     start_date=now-timedelta(days=20),  end_date=now-timedelta(days=19)),
]

TEAMS = [
    dict(name="Phantom Protocol",  members=[1,2,3,4]),
    dict(name="Nullbyte Nexus",     members=[5,6,7]),
    dict(name="CipherStrike",       members=[1,5,9,15]),
    dict(name="Neural Defenders",   members=[2,7,13]),
    dict(name="Zero Day Squad",     members=[3,6,14,4]),
]

POSTS = [
    dict(user_idx=0, content="Just solved the JWT none-algorithm challenge in CyberCTF! Key insight: always validate alg header before decoding.", code="// VULNERABLE — never do this:\nconst decoded = jwt.decode(token, { algorithms: ['none'] })\n\n// SECURE:\nconst decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] })"),
    dict(user_idx=1, content="Trained an adversarial detection model achieving 94.7% accuracy on MNIST-C dataset. Key: ensemble of autoencoders + Mahalanobis distance for anomaly scoring.", code=None),
    dict(user_idx=2, content="PSA: Saw many FastAPI apps exposing /docs in prod with no auth. Always protect your OpenAPI endpoint!", code="# Disable docs in prod:\napp = FastAPI(\n  docs_url=None if ENV=='prod' else '/docs',\n  redoc_url=None\n)"),
    dict(user_idx=8, content="Found a real-world SSRF in a popular API gateway. Reported via responsible disclosure. Full writeup coming soon!", code=None),
    dict(user_idx=6, content="Released my Adversarial Patch generator trained on YOLOv8. Can fool object detection with a single 30px sticker. Paper linked in profile.", code=None),
    dict(user_idx=13, content="Completed the Kubernetes Security CKS exam — here are my top 10 study resources for anyone prepping.", code=None),
    dict(user_idx=4, content="Great resource for learning OSINT: IntelTechniques by OSINT Curious. Combined with Shodan = powerful recon toolkit.", code=None),
]


async def seed():
    print("🌱 Initializing database…")
    await init_db()
    print("📦 Seeding data…")

    async with AsyncSessionLocal() as db:
        # Insert users
        user_objs = {}
        for u in USERS:
            user = User(
                name=u["name"], email=u["email"],
                hashed_password=hash_password(u["password"]),
                domain=u["domain"], experience=u["experience"], skills=u["skills"],
            )
            db.add(user)
        await db.flush()

        # Fetch all users by email
        from sqlalchemy import select
        result = await db.execute(select(User))
        all_users = {u.email: u for u in result.scalars().all()}

        # Leaderboard entries
        for stat in LEADERBOARD_STATS:
            user = all_users.get(stat["email"])
            if not user: continue
            lb = LeaderboardEntry(
                user_id=user.id,
                events_count=stat["events"],
                posts_count=stat["posts"],
                upvotes_received=stat["upvotes"],
                hackathon_wins=stat["wins"],
                mentorship_sessions=stat["mentorship"],
                badges=stat["badges"],
            )
            db.add(lb)

        # Events
        event_objs = []
        creator = all_users.get("arya@hq.dev")
        for e in EVENTS:
            event = Event(created_by=creator.id, is_active=True, participants=[], **e)
            db.add(event)
            event_objs.append(event)

        await db.flush()

        # Teams
        user_list = list(all_users.values())
        for t in TEAMS:
            member_ids = [user_list[i-1].id for i in t["members"] if i-1 < len(user_list)]
            team = Team(name=t["name"], members=member_ids, compatibility_score=70 + len(member_ids) * 5)
            db.add(team)

        # Posts
        for p in POSTS:
            user = user_list[p["user_idx"]] if p["user_idx"] < len(user_list) else user_list[0]
            post = Post(user_id=user.id, content=p["content"], code_snippet=p.get("code"), upvotes=0, downvotes=0)
            db.add(post)

        await db.commit()
        print("✅ Seeded:")
        print(f"   → {len(USERS)} users")
        print(f"   → {len(LEADERBOARD_STATS)} leaderboard entries")
        print(f"   → {len(EVENTS)} events")
        print(f"   → {len(TEAMS)} teams")
        print(f"   → {len(POSTS)} community posts")
        print("\n🔑 Demo credentials:")
        for u in USERS[:5]:
            print(f"   email: {u['email']}  |  password: {u['password']}")


if __name__ == "__main__":
    asyncio.run(seed())
