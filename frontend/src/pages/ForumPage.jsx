import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ThumbsUp, ThumbsDown, Search, Plus, X, ChevronDown, ChevronUp, Bookmark, Flag, Check, TrendingUp, Hash } from 'lucide-react'
import { useSelector } from 'react-redux'

// Green = Security/CTF posts | Blue = AI/ML/Dev/General posts
const CATEGORIES = ['All', 'AI/ML', 'Cybersecurity', 'Web Dev', 'Hackathons', 'Internships', 'Open Source', 'General']
const CAT_COLORS = {
    'AI/ML': { c: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' },
    'Cybersecurity': { c: '#00ff41', bg: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.2)' },
    'Web Dev': { c: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' },
    'Hackathons': { c: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    'Internships': { c: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' },
    'Open Source': { c: '#00ff41', bg: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.2)' },
    'General': { c: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
}
const ALL_TAGS = ['Python', 'CTF', 'AI', 'Web Security', 'Machine Learning', 'JWT', 'SQLi', 'Internship', 'React', 'FastAPI']

const INIT_POSTS = [
    { id: 1, title: 'Best resources to learn JWT vulnerabilities?', body: 'I\'ve been doing CTFs and keep seeing JWT-based challenges. What are the best resources to deeply understand JWT attacks like alg:none, RS256→HS256 confusion, and kid injection?', category: 'Cybersecurity', tags: ['JWT', 'CTF', 'Web Security'], author: 'Arya Sharma', av: 'AS', time: '2h ago', upvotes: 42, downvotes: 2, type: 'question', accepted: null, replies: [{ id: 101, author: 'Ravi Nair', av: 'RN', time: '1h ago', body: 'PortSwigger Web Academy has the best JWT labs. Also check CVE-2022-21449 for a real-world alg confusion bug.', upvotes: 18, accepted: false }, { id: 102, author: 'Priya Mehta', av: 'PM', time: '45m ago', body: 'HackTricks JWT section is gold. Combined with a personal Docker lab you\'ll crack most CTF JWT challenges.', upvotes: 11, accepted: false }], bookmarked: false },
    { id: 2, title: 'How do you prevent model inversion attacks in production ML systems?', body: 'We\'re deploying a classification model and a red-team assessment flagged model inversion as a risk. Anyone implemented differential privacy or other mitigations in a production system?', category: 'AI/ML', tags: ['Machine Learning', 'AI', 'Python'], author: 'Ravi Nair', av: 'RN', time: '5h ago', upvotes: 67, downvotes: 1, type: 'question', accepted: 0, replies: [{ id: 201, author: 'Meera Pillai', av: 'MP', time: '4h ago', body: 'Differential privacy via TensorFlow Privacy is the go-to. Also look into output perturbation and confidence score truncation from model APIs.', upvotes: 29, accepted: true }], bookmarked: true },
    { id: 3, title: 'My CTF writeup: RCE via deserialization in HackAI 2026', body: 'Just finished the HackAI CTF forensics challenge. Here\'s my full writeup on how I achieved RCE through Java deserialization. The key was crafting a gadget chain using ysoserial targeting the Commons Collections library...', category: 'Cybersecurity', tags: ['CTF', 'Python', 'Web Security'], author: 'Kiran Das', av: 'KD', time: '1d ago', upvotes: 89, downvotes: 0, type: 'discussion', accepted: null, replies: [], bookmarked: false },
    { id: 4, title: 'Internship opportunities in AI security — share your experience', body: 'Looking for internship leads in the intersection of AI and cybersecurity. Has anyone interned at companies like Palo Alto, Recorded Future, or any AI safety orgs? What was the hiring process like?', category: 'Internships', tags: ['Internship', 'AI', 'CTF'], author: 'Sana Qureshi', av: 'SQ', time: '2d ago', upvotes: 54, downvotes: 3, type: 'discussion', accepted: null, replies: [], bookmarked: false },
    { id: 5, title: 'FastAPI + SQLAlchemy async: best practices for production', body: 'We\'re building the HQ backend and hitting async session issues with SQLAlchemy 2.0. Has anyone successfully deployed FastAPI with async postgres in production? Any gotchas with connection pooling under load?', category: 'Web Dev', tags: ['FastAPI', 'Python', 'React'], author: 'Deepak Rao', av: 'DR', time: '3d ago', upvotes: 38, downvotes: 1, type: 'question', accepted: null, replies: [], bookmarked: false },
]

const TRENDING = [
    { title: 'JWT Vulnerabilities', votes: 142, cat: 'Cybersecurity' },
    { title: 'Model Inversion Defenses', votes: 98, cat: 'AI/ML' },
    { title: 'CTF Deserialization RCE', votes: 89, cat: 'Cybersecurity' },
    { title: 'Internships at AI Security firms', votes: 54, cat: 'Internships' },
]

function catCol(cat) { return CAT_COLORS[cat] || { c: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' } }
function isAI(cat) { return ['AI/ML', 'Web Dev', 'Internships', 'General'].includes(cat) }

export default function ForumPage() {
    const { user } = useSelector(s => s.auth)
    const [posts, setPosts] = useState(INIT_POSTS)
    const [category, setCategory] = useState('All')
    const [search, setSearch] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ title: '', body: '', category: 'General', tags: [], type: 'question' })
    const [selectedTag, setSelectedTag] = useState(null)
    const [bookmarks, setBookmarks] = useState({ 2: true })

    const filtered = posts.filter(p => {
        if (category !== 'All' && p.category !== category) return false
        if (selectedTag && !p.tags.includes(selectedTag)) return false
        if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.body.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const vote = (id, dir) => setPosts(ps => ps.map(p => p.id === id ? { ...p, [dir === 'up' ? 'upvotes' : 'downvotes']: p[dir === 'up' ? 'upvotes' : 'downvotes'] + 1 } : p))
    const toggleBookmark = (id) => setBookmarks(b => ({ ...b, [id]: !b[id] }))
    const addReply = (postId) => {
        if (!replyText.trim()) return
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: Date.now(), author: user?.name || 'Anonymous', av: (user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AN'), time: 'just now', body: replyText, upvotes: 0, accepted: false }] } : p))
        setReplyText('')
    }
    const markAccepted = (postId, replyId) => {
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, accepted: replyId, replies: p.replies.map(r => ({ ...r, accepted: r.id === replyId })) } : p))
    }
    const createPost = () => {
        if (!form.title.trim()) return
        setPosts(p => [{ id: Date.now(), ...form, author: user?.name || 'Anonymous', av: (user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AN'), time: 'just now', upvotes: 0, downvotes: 0, replies: [], bookmarked: false, accepted: null }, ...p])
        setForm({ title: '', body: '', category: 'General', tags: [], type: 'question' }); setShowCreate(false)
    }

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />
            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* ─ Main column ─ */}
                <div>
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9' }}>
                                    Command <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Forum</span>
                                </h1>
                                <p style={{ color: '#3a6b45', fontSize: '0.85rem', marginTop: '0.2rem' }}>Ask questions · Share writeups · Discuss ideas</p>
                            </div>
                            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,65,0.3),0 0 60px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.96 }}
                                onClick={() => setShowCreate(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.3rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                                <Plus size={14} /> NEW POST
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#3a6b45' }} />
                        <input className="cyber-input" placeholder="Search posts, questions, writeups…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
                    </div>

                    {/* Categories */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {CATEGORIES.map(c => {
                            const col = catCol(c)
                            const active = category === c
                            return (
                                <button key={c} onClick={() => setCategory(c)}
                                    style={{ padding: '0.38rem 0.75rem', borderRadius: '6px', border: active ? `1px solid ${col.c}50` : '1px solid rgba(100,116,139,0.1)', background: active ? col.bg : 'rgba(0,0,0,0.2)', color: active ? col.c : '#3a6b45', fontSize: '0.73rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                    {c}
                                </button>
                            )
                        })}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {ALL_TAGS.map(tag => (
                            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                style={{ padding: '0.25rem 0.55rem', borderRadius: '4px', border: selectedTag === tag ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(100,116,139,0.08)', background: selectedTag === tag ? 'rgba(0,212,255,0.07)' : 'transparent', color: selectedTag === tag ? '#00d4ff' : '#3a6b45', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                #{tag}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filtered.map((post, i) => {
                            const col = catCol(post.category)
                            const ai = isAI(post.category)
                            const open = expanded === post.id
                            const bm = bookmarks[post.id]
                            return (
                                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ background: ai ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: `1px solid ${col.border}`, borderRadius: '12px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, background: `linear-gradient(180deg,${col.c},transparent)`, borderRadius: '12px 0 0 12px' }} />

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {/* Vote column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: '36px' }}>
                                            <motion.button whileHover={{ scale: 1.15 }} onClick={() => vote(post.id, 'up')} style={{ background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer' }}><ThumbsUp size={14} /></motion.button>
                                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700, color: col.c }}>{post.upvotes}</span>
                                            <motion.button whileHover={{ scale: 1.15 }} onClick={() => vote(post.id, 'dn')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><ThumbsDown size={12} /></motion.button>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', color: col.c, background: col.bg, border: `1px solid ${col.border}`, borderRadius: '4px', padding: '0.09rem 0.35rem', fontFamily: 'JetBrains Mono' }}>{post.category}</span>
                                                <span style={{ fontSize: '0.62rem', color: post.type === 'question' ? '#00d4ff' : '#f59e0b', background: post.type === 'question' ? 'rgba(0,212,255,0.06)' : 'rgba(245,158,11,0.06)', border: post.type === 'question' ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', padding: '0.09rem 0.35rem', fontFamily: 'JetBrains Mono' }}>{post.type === 'question' ? '❓ Question' : '💬 Discussion'}</span>
                                                {post.accepted !== null && post.type === 'question' && <span style={{ fontSize: '0.62rem', color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '4px', padding: '0.09rem 0.35rem', fontFamily: 'JetBrains Mono' }}>✅ Answered</span>}
                                            </div>
                                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.5rem', cursor: 'pointer', lineHeight: 1.3 }} onClick={() => setExpanded(open ? null : post.id)}>{post.title}</h3>
                                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: open ? 100 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</p>

                                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                {post.tags.map(t => <span key={t} style={{ fontSize: '0.6rem', color: '#3a6b45', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,116,139,0.1)', borderRadius: '3px', padding: '0.06rem 0.3rem', fontFamily: 'JetBrains Mono' }}>#{t}</span>)}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#3a6b45', flexWrap: 'wrap' }}>
                                                <span>{post.author} · {post.time}</span>
                                                <button onClick={() => setExpanded(open ? null : post.id)} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'JetBrains Mono' }}>
                                                    <MessageSquare size={11} /> {post.replies.length} {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                </button>
                                                <button onClick={() => toggleBookmark(post.id)} style={{ background: 'none', border: 'none', color: bm ? '#f59e0b' : '#3a6b45', cursor: 'pointer' }}><Bookmark size={12} /></button>
                                                <button style={{ background: 'none', border: 'none', color: '#3a6b45', cursor: 'pointer' }}><Flag size={11} /></button>
                                            </div>

                                            {/* Replies */}
                                            <AnimatePresence>
                                                {open && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        style={{ marginTop: '1rem', borderTop: `1px solid ${col.border}`, paddingTop: '1rem' }}>
                                                        {post.replies.map(r => (
                                                            <div key={r.id} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem' }}>
                                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0096cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#020d04', flexShrink: 0 }}>{r.av}</div>
                                                                <div style={{ flex: 1, background: r.accepted ? 'rgba(0,255,65,0.04)' : 'rgba(0,0,0,0.25)', border: r.accepted ? '1px solid rgba(0,255,65,0.2)' : '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8f5e9' }}>{r.author} <span style={{ color: '#3a6b45', fontWeight: 400 }}>· {r.time}</span></span>
                                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                            {r.accepted && <span style={{ fontSize: '0.6rem', color: '#00ff41', fontFamily: 'JetBrains Mono' }}>✅ Accepted</span>}
                                                                            {post.type === 'question' && !r.accepted && post.accepted === null && (
                                                                                <button onClick={() => markAccepted(post.id, r.id)} style={{ fontSize: '0.6rem', background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41', borderRadius: '4px', padding: '0.06rem 0.35rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>✓ Accept</button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.65 }}>{r.body}</p>
                                                                    <div style={{ marginTop: '0.35rem', fontSize: '0.68rem', color: '#3a6b45', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                        <ThumbsUp size={10} style={{ color: '#00ff41' }} /> {r.upvotes}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                            <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(post.id)} className="cyber-input" placeholder="Write a reply…" style={{ borderColor: 'rgba(0,212,255,0.15)', fontSize: '0.8rem' }} />
                                                            <motion.button whileHover={{ scale: 1.06 }} onClick={() => addReply(post.id)} style={{ padding: '0.5rem 0.85rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px', color: '#00d4ff', cursor: 'pointer', flexShrink: 0, fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>Reply</motion.button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* ─ Sidebar ─ */}
                <div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        style={{ background: 'rgba(0,5,20,0.85)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', position: 'sticky', top: '90px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <TrendingUp size={14} style={{ color: '#00d4ff' }} />
                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 700, color: '#00d4ff' }}>TRENDING</span>
                        </div>
                        {TRENDING.map((t, i) => {
                            const col = catCol(t.cat)
                            return (
                                <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#e8f5e9', marginBottom: '0.2rem', lineHeight: 1.3 }}>{t.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ fontSize: '0.62rem', color: col.c, background: col.bg, border: `1px solid ${col.border}`, borderRadius: '3px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>{t.cat}</span>
                                        <span style={{ fontSize: '0.62rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>▲ {t.votes}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        style={{ background: 'rgba(5,18,8,0.85)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Hash size={14} style={{ color: '#00ff41' }} />
                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 700, color: '#00ff41' }}>POPULAR TAGS</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {ALL_TAGS.map(tag => (
                                <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: selectedTag === tag ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(0,255,65,0.1)', background: selectedTag === tag ? 'rgba(0,255,65,0.08)' : 'transparent', color: selectedTag === tag ? '#00ff41' : '#3a6b45', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>#{tag}</button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─ Create Post Modal ─ */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,4,0.9)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                            style={{ background: 'rgba(5,18,8,0.98)', border: '1px solid rgba(0,255,65,0.22)', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
                            <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)', borderRadius: '16px 16px 0 0' }} />
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.15rem', fontWeight: 800, color: '#e8f5e9' }}>New Post</h2>
                                    <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#3a6b45', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['question', 'discussion'].map(t => (
                                            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                                                style={{ flex: 1, padding: '0.55rem', borderRadius: '7px', border: form.type === t ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(100,116,139,0.1)', background: form.type === t ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.2)', color: form.type === t ? '#00d4ff' : '#3a6b45', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                {t === 'question' ? '❓ Question' : '💬 Discussion'}
                                            </button>
                                        ))}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>TITLE</label>
                                        <input className="cyber-input" placeholder="What are you asking or sharing?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>BODY</label>
                                        <textarea className="cyber-input" placeholder="Describe your question or share your insights…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'Inter' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>CATEGORY</label>
                                        <select className="cyber-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>TAGS</label>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                            {ALL_TAGS.map(t => (
                                                <button key={t} onClick={() => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }))}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: form.tags.includes(t) ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(100,116,139,0.1)', background: form.tags.includes(t) ? 'rgba(0,255,65,0.08)' : 'transparent', color: form.tags.includes(t) ? '#00ff41' : '#3a6b45', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                    #{t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,255,65,0.25),0 0 60px rgba(0,212,255,0.12)' }} whileTap={{ scale: 0.97 }}
                                        onClick={createPost} style={{ padding: '0.85rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
                                        PUBLISH POST
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
