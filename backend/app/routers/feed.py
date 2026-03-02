from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import Post, ThreatAnalysisLog, User, LeaderboardEntry
from app.schemas.schemas import PostCreate
from app.services.auth_service import get_current_user
from app.ai.threat_analyzer import analyze_threat

router = APIRouter(prefix="/feed", tags=["feed"])

@router.get("/posts")
async def list_posts(page: int = 1, db: AsyncSession = Depends(get_db)):
    limit, offset = 20, (page - 1) * 20
    result = await db.execute(
        select(Post, User).join(User, Post.user_id == User.id)
        .where(Post.thread_id == None)
        .offset(offset).limit(limit)
    )
    rows = result.all()
    posts = []
    for post, user in rows:
        posts.append({
            "id": post.id,
            "content": post.content,
            "code_snippet": post.code_snippet,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes,
            "created_at": post.created_at.isoformat(),
            "author": user.name,
            "avatar": "".join(w[0] for w in user.name.split()[:2]).upper(),
            "domain": user.domain,
        })
    return posts

@router.post("/posts")
async def create_post(
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Analyze threat
    combined = body.content + (" " + body.code_snippet if body.code_snippet else "")
    threat = analyze_threat(combined)

    post = Post(
        user_id=current_user.id,
        content=body.content,
        code_snippet=body.code_snippet,
        thread_id=body.thread_id,
    )
    db.add(post)
    await db.flush()

    # Log threat result
    log = ThreatAnalysisLog(
        post_id=post.id,
        threat_level=threat["threat_level"],
        threat_score=threat["threat_score"],
        patterns_found=threat["patterns_found"],
        mitigation=threat["mitigation"],
    )
    db.add(log)

    # Update leaderboard: posts_count +1
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == current_user.id))
    lb = lb_result.scalar_one_or_none()
    if lb:
        lb.posts_count += 1

    await db.commit()
    await db.refresh(post)
    return {"post_id": post.id, "threat": threat}

@router.post("/posts/{post_id}/upvote")
async def upvote(post_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.upvotes += 1
    # Credit upvote to post author's leaderboard
    lb_result = await db.execute(select(LeaderboardEntry).where(LeaderboardEntry.user_id == post.user_id))
    lb = lb_result.scalar_one_or_none()
    if lb:
        lb.upvotes_received += 1
    await db.commit()
    return {"upvotes": post.upvotes}

@router.post("/posts/{post_id}/downvote")
async def downvote(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.downvotes += 1
    await db.commit()
    return {"downvotes": post.downvotes}

@router.post("/posts/{post_id}/reply")
async def reply(post_id: int, body: PostCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    parent = await db.get(Post, post_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Post not found")
    reply_post = Post(user_id=current_user.id, content=body.content, thread_id=post_id)
    db.add(reply_post)
    await db.commit()
    await db.refresh(reply_post)
    return {"reply_id": reply_post.id}
