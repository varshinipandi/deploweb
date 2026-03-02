# Digital Headquarters — AI × Cybersecurity Community Platform

<div align="center">
  <h3>🛡️ Build. Hack. Secure. Lead. 🧠</h3>
  <p>A production-ready, scalable community platform removing digital gravity from AI × Cybersecurity collaboration.</p>
</div>

---

## ✨ Feature Modules

| Module | Description |
|---|---|
| 🌐 **Landing Page** | Animated particle canvas, glitch text, typewriter, event ticker |
| 🔐 **Auth** | JWT + bcrypt, 3-step signup, role-based access, rate limiting |
| ⚡ **Events** | Countdown timers, AI-recommended events, tag/difficulty filters |
| 👥 **Teams** | AI Compatibility Engine (skill vector scoring, radar chart) |
| 🏆 **Leaderboard** | Live-updating scores, Bronze→Platinum tiers, achievement badges |
| 💬 **Community Feed** | Posts + code blocks, AI Threat Analyzer auto-scan, threaded replies |
| 🛡️ **Threat Analyzer** | 10-rule OWASP engine: SQLi, XSS, JWT none-alg, hardcoded creds, command injection… |
| 👤 **Profile** | Skill radar chart, GitHub-style contribution heatmap, AI learning roadmap |
| 🤖 **ARIA Chatbot** | Floating AI assistant with 9-category cybersecurity knowledge base |

---

## 🚀 Quick Start

### Frontend Only (Demo mode — no backend needed)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

**Demo login:** `arya@hq.dev` / `hq123456`

---

### Full Stack (Local)

**Prerequisites:** Python 3.12+, PostgreSQL, Redis

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL and REDIS_URL

# 2. Seed database
python seed.py

# 3. Start backend
uvicorn app.main:app --reload --port 8000

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

### Full Stack (Docker Compose)

```bash
# 1. Set secret key
cp backend/.env.example backend/.env
# Edit SECRET_KEY in .env

# 2. Build and run all services
docker-compose up --build

# Services:
# Frontend  → http://localhost:3000
# Backend   → http://localhost:8000
# API Docs  → http://localhost:8000/docs  (development only)
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
cd frontend
npm run build
vercel deploy

# Option B: GitHub import
# Push to GitHub → Import project in Vercel dashboard
# Build command: npm run build
# Output directory: dist
```

**Vercel environment variables:**
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render

1. Create new **Web Service** in Render
2. Connect GitHub repository, set **Root Directory** to `backend`
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

**Environment variables for Render:**
```
DATABASE_URL=postgresql+asyncpg://...  (from Neon/Supabase)
REDIS_URL=redis://...                  (from Upstash)
SECRET_KEY=<256-bit random string>
ENVIRONMENT=production
CORS_ORIGINS=["https://yourapp.vercel.app"]
```

### Database → Neon (PostgreSQL)

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string → set as `DATABASE_URL` (replace `postgresql://` with `postgresql+asyncpg://`)
3. Run seed script locally pointing at Neon: `DATABASE_URL=<neon_url> python seed.py`

### Redis → Upstash

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy Redis URL → set as `REDIS_URL`

---

## 📡 API Documentation

Base URL: `http://localhost:8000/api` (dev) | `https://your-backend.onrender.com/api` (prod)

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create account (3-step) | — |
| POST | `/auth/login` | Login, returns JWT | — |
| GET | `/auth/me` | Get current user | ✅ JWT |

### Events

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/events?tag=CTF&difficulty=Advanced` | List events with optional filters | — |
| GET | `/events/{id}` | Get single event | — |
| POST | `/events` | Create event | ✅ Admin |
| POST | `/events/{id}/register` | Register for event | ✅ JWT |

### Teams

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/teams` | List all teams | — |
| POST | `/teams` | Create team | ✅ JWT |
| POST | `/teams/compatibility` | Run AI compatibility score | — |

### Leaderboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/leaderboard` | Ranked leaderboard | — |
| GET | `/leaderboard/me` | My rank + stats | ✅ JWT |
| WS | `/leaderboard/ws` | Real-time updates every 5s | — |

### Community Feed

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/feed/posts?page=1` | Paginated posts | — |
| POST | `/feed/posts` | Create post (auto threat scan) | ✅ JWT |
| POST | `/feed/posts/{id}/upvote` | Upvote | ✅ JWT |
| POST | `/feed/posts/{id}/reply` | Reply to post | ✅ JWT |

### Profile

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/profile/{user_id}` | Get user profile | — |
| PUT | `/profile/me` | Edit profile | ✅ JWT |
| GET | `/profile/{user_id}/roadmap` | AI learning path | — |

---

## 🔒 Security Architecture

| Control | Implementation |
|---|---|
| Passwords | bcrypt (passlib, 12 rounds) |
| Tokens | JWT HS256, 60-minute expiry |
| Input Validation | Pydantic strict models on all endpoints |
| SQL Safety | SQLAlchemy ORM (parameterized only) |
| Rate Limiting | SlowAPI (per-IP limits) |
| CORS | Explicit origin whitelist |
| Security Headers | HSTS, X-Frame, X-Content-Type, XSS-Protection |
| Output Encoding | HTML entity escaping on all user content |
| Threat Logging | All AI scan results stored in DB |
| Docs Protection | OpenAPI hidden in production environment |

---

## 🧠 AI Features

### Team Compatibility Engine
```
Score = 0.40 × CoverageAvg + 0.30 × Balance + 0.30 × Diversity
```
- **Coverage**: % of canonical domain skills covered per category
- **Balance**: 1 − (max_skills − avg_skills) / max_skills
- **Diversity**: unique_domains / total_domain_categories

### Cyber Threat Analyzer (10 OWASP Rules)
| Pattern | OWASP | Level |
|---|---|---|
| SQL Injection | A03:2021 | Critical |
| XSS | A03:2021 | High |
| Hardcoded Credentials | A02:2021 | Critical |
| Command Injection | A03:2021 | Critical |
| JWT None Algorithm | A02:2021 | Critical |
| SSRF | A10:2021 | High |
| Path Traversal | A01:2021 | High |
| Eval/Code Injection | A03:2021 | High |
| Weak Cryptography | A02:2021 | Medium |
| Permissive CORS | A05:2021 | Medium |

### Leaderboard Scoring Formula
```
Score = (Events × 10) + (Posts × 5) + (Upvotes × 3) + (Wins × 50) + (Mentorship × 20)
```

---

## 📁 Project Structure

```
deploweb/
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/axios.js
│       ├── store/
│       │   ├── store.js, authSlice.js, eventsSlice.js
│       │   └── leaderboardSlice.js, feedSlice.js, teamsSlice.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ARIAChatbot.jsx          ← ARIA AI assistant
│       └── pages/
│           ├── LandingPage.jsx          ← Glitch text + particle canvas
│           ├── LoginPage.jsx
│           ├── SignupPage.jsx           ← 3-step form
│           ├── EventsPage.jsx
│           ├── TeamsPage.jsx            ← AI Compatibility Engine
│           ├── LeaderboardPage.jsx      ← Live scoring
│           ├── CommunityFeedPage.jsx    ← Auto threat scan
│           ├── ProfilePage.jsx          ← Radar + heatmap
│           └── ThreatAnalyzerPage.jsx   ← OWASP scanner tool
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── seed.py                          ← Run to populate DB
    ├── .env.example
    └── app/
        ├── main.py                     ← FastAPI + middleware
        ├── config.py, database.py, redis_client.py
        ├── models/models.py
        ├── schemas/schemas.py
        ├── services/auth_service.py    ← bcrypt + JWT
        ├── ai/
        │   ├── threat_analyzer.py     ← 10-rule engine
        │   └── team_compatibility.py  ← Scoring algorithm
        └── routers/
            ├── auth.py, events.py, teams.py
            ├── leaderboard.py         ← WebSocket /ws
            ├── feed.py, profile.py
```

---

## 🏆 Hackathon Judging Notes

1. **Originality** — All AI logic (compatibility engine, threat analyzer) custom-built. No copied templates.
2. **Production-Ready** — Docker Compose, nginx, security headers, CORS whitelist, secrets via env vars.
3. **AI Integration** — Three distinct AI features: ARIA chatbot, threat analyzer, team compatibility scoring.
4. **Security-First** — OWASP-aligned: bcrypt, JWT, input validation, parameterized queries, rate limiting.
5. **UX/Design** — Animated cyber-neon UI with Framer Motion, radar charts, heatmaps, glitch text.

---

*Digital HQ © 2026 · Antigravity ∞ · Built for State-Level Hackathon*
