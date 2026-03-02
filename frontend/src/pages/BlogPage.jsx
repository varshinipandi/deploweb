import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Clock, ThumbsUp, MessageSquare, Plus, X, Eye, Bookmark, TrendingUp } from 'lucide-react'
import { useSelector } from 'react-redux'

const ARTICLES = [
    { id: 1, title: 'Prompt Injection Attacks: How Hackers Hijack Your AI Apps', slug: 'prompt-injection-attacks', author: 'Arya Sharma', av: 'AS', domain: 'Cybersecurity', date: 'Feb 28, 2026', readTime: 8, cover: null, excerpt: 'As LLMs get embedded into production apps, prompt injection has emerged as a critical attack vector. Here\'s a deep dive into direct vs indirect injection, real-world examples, and how to build robust defenses.', tags: ['AI Security', 'LLMs', 'Prompt Injection'], claps: 142, comments: 12, featured: true },
    { id: 2, title: 'Building an Adversarial ML Defense Pipeline with TF Privacy', slug: 'adversarial-ml-defense', author: 'Ravi Nair', av: 'RN', domain: 'AI', date: 'Feb 25, 2026', readTime: 12, cover: null, excerpt: 'We built a production ML pipeline with differential privacy (ε=0.5) and Gaussian noise injection. In this article I walk through the architecture, tradeoffs, and why model performance didn\'t degrade as much as expected.', tags: ['Machine Learning', 'Privacy', 'TensorFlow'], claps: 98, comments: 8, featured: true },
    { id: 3, title: 'JWT Confusion Attacks: From Theory to CTF', slug: 'jwt-confusion-attacks', author: 'Kiran Das', av: 'KD', domain: 'Cybersecurity', date: 'Feb 22, 2026', readTime: 6, cover: null, excerpt: 'A practical walkthrough of RS256→HS256 algorithm confusion attacks. With PortSwigger\'s JWT labs as a guide, I show how to extract public keys and forge tokens — and how to prevent it.', tags: ['JWT', 'CTF', 'Web Security'], claps: 76, comments: 5, featured: false },
    { id: 4, title: 'From Zero to CTF Hero: My 6-Month Learning Path', slug: 'zero-to-ctf-hero', author: 'Meera Pillai', av: 'MP', domain: 'General', date: 'Feb 18, 2026', readTime: 10, cover: null, excerpt: 'Six months ago I couldn\'t find a buffer overflow. Last month I ranked top 50 in a major international CTF. Here\'s the exact curriculum, tools, and challenge platforms I used.', tags: ['CTF', 'Learning', 'Cybersecurity'], claps: 224, comments: 31, featured: true },
    { id: 5, title: 'Deploying FastAPI at Scale: Lessons from Production', slug: 'fastapi-at-scale', author: 'Deepak Rao', av: 'DR', domain: 'Web Dev', date: 'Feb 14, 2026', readTime: 9, cover: null, excerpt: 'After running FastAPI in production with 50k daily requests, we\'ve learned hard lessons about async session management, connection pool exhaustion, and why you definitely want a proper APM from day one.', tags: ['FastAPI', 'Python', 'Backend'], claps: 63, comments: 4, featured: false },
]

const tagColors = (tag) => {
    const sec = ['JWT', 'CTF', 'Web Security', 'Cybersecurity', 'Prompt Injection', 'AI Security']
    return sec.includes(tag)
        ? { c: '#00ff41', bg: 'rgba(0,255,65,0.07)', border: 'rgba(0,255,65,0.18)' }
        : { c: '#00d4ff', bg: 'rgba(0,212,255,0.07)', border: 'rgba(0,212,255,0.18)' }
}
const domainIsAI = d => ['AI', 'Web Dev', 'General'].includes(d)

export default function BlogPage() {
    const { user } = useSelector(s => s.auth)
    const [articles, setArticles] = useState(ARTICLES)
    const [expanded, setExpanded] = useState(null)
    const [clapState, setClapState] = useState({})
    const [bookmarks, setBookmarks] = useState({})
    const [comment, setComment] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ title: '', excerpt: '', body: '', tags: [], domain: 'AI' })
    const [filter, setFilter] = useState('All')

    const clap = (id) => {
        setClapState(s => ({ ...s, [id]: (s[id] || 0) + 1 }))
        setArticles(as => as.map(a => a.id === id ? { ...a, claps: a.claps + 1 } : a))
    }
    const addComment = (id) => {
        if (!comment.trim()) return
        setArticles(as => as.map(a => a.id === id ? { ...a, comments: a.comments + 1 } : a))
        setComment('')
    }
    const publish = () => {
        if (!form.title.trim()) return
        setArticles(as => [{ id: Date.now(), ...form, author: user?.name || 'Anonymous', av: (user?.name?.split(' ').map(w => w[0]).join('') || 'AN').slice(0, 2), date: 'Mar 1, 2026', readTime: Math.ceil(form.body.split(' ').length / 200) || 3, claps: 0, comments: 0, featured: false }, ...as])
        setForm({ title: '', excerpt: '', body: '', tags: [], domain: 'AI' }); setShowCreate(false)
    }

    const ALL_TAGS = [...new Set(ARTICLES.flatMap(a => a.tags))]
    const filtered = filter === 'All' ? articles : articles.filter(a => a.tags.includes(filter) || a.domain === filter)
    const featured = filtered.filter(a => a.featured)

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9' }}>
                            HQ <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Blog</span>
                        </h1>
                        <p style={{ color: '#3a6b45', fontSize: '0.85rem', marginTop: '0.2rem' }}>Research · Tutorials · Writeups · Insights</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,65,0.3),0 0 60px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => setShowCreate(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.3rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                        <Plus size={14} /> WRITE ARTICLE
                    </motion.button>
                </motion.div>

                {/* Tag filter */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <button onClick={() => setFilter('All')} style={{ padding: '0.32rem 0.7rem', borderRadius: '6px', border: filter === 'All' ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(100,116,139,0.1)', background: filter === 'All' ? 'rgba(0,212,255,0.08)' : 'transparent', color: filter === 'All' ? '#00d4ff' : '#3a6b45', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>All</button>
                    {ALL_TAGS.map(tag => {
                        const tc = tagColors(tag)
                        return (
                            <button key={tag} onClick={() => setFilter(tag)}
                                style={{ padding: '0.32rem 0.7rem', borderRadius: '6px', border: filter === tag ? `1px solid ${tc.border}` : '1px solid rgba(100,116,139,0.1)', background: filter === tag ? tc.bg : 'transparent', color: filter === tag ? tc.c : '#3a6b45', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                {tag}
                            </button>
                        )
                    })}
                </div>

                {/* Featured strip */}
                {featured.length > 0 && filter === 'All' && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <TrendingUp size={14} style={{ color: '#00d4ff' }} />
                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.78rem', color: '#00d4ff', fontWeight: 700 }}>FEATURED</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                            {featured.map(a => {
                                const ai = domainIsAI(a.domain)
                                return (
                                    <motion.div key={a.id} whileHover={{ y: -4 }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                                        style={{ background: ai ? 'rgba(0,5,20,0.9)' : 'rgba(5,18,8,0.9)', border: ai ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(0,255,65,0.18)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                                        {/* Cover placeholder */}
                                        <div style={{ height: '100px', background: ai ? 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,100,180,0.05))' : 'linear-gradient(135deg,rgba(0,255,65,0.12),rgba(0,100,60,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <span style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', opacity: 0.08 }}>{ai ? '🧠' : '🛡️'}</span>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: ai ? 'linear-gradient(90deg,transparent,#00d4ff,transparent)' : 'linear-gradient(90deg,transparent,#00ff41,transparent)' }} />
                                            <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', fontSize: '0.58rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px', padding: '0.06rem 0.35rem', fontFamily: 'JetBrains Mono' }}>⭐ FEATURED</span>
                                        </div>
                                        <div style={{ padding: '1.1rem' }}>
                                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.45rem', lineHeight: 1.3 }}>{a.title}</h3>
                                            <p style={{ fontSize: '0.76rem', color: '#3a6b45', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>{a.excerpt}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: ai ? 'linear-gradient(135deg,#00d4ff,#0096cc)' : 'linear-gradient(135deg,#00ff41,#00c853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#020d04', fontWeight: 700 }}>{a.av}</div>
                                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{a.author}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#3a6b45', alignItems: 'center', fontFamily: 'JetBrains Mono' }}>
                                                    <Clock size={10} /> {a.readTime}m
                                                    <ThumbsUp size={10} style={{ color: '#00ff41' }} /> {a.claps + (clapState[a.id] || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* All articles list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map((a, i) => {
                        const ai = domainIsAI(a.domain)
                        const isOpen = expanded === a.id
                        const myClaps = clapState[a.id] || 0
                        return (
                            <motion.div key={a.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                style={{ background: ai ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: ai ? '1px solid rgba(0,212,255,0.12)' : '1px solid rgba(0,255,65,0.1)', borderRadius: '12px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, background: ai ? 'linear-gradient(180deg,#00d4ff,transparent)' : 'linear-gradient(180deg,#00ff41,transparent)', borderRadius: '12px 0 0 12px' }} />

                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ai ? 'linear-gradient(135deg,#00d4ff,#0096cc)' : 'linear-gradient(135deg,#00ff41,#00c853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#020d04', flexShrink: 0 }}>{a.av}</div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e8f5e9' }}>{a.author}</span>
                                        <div style={{ fontSize: '0.65rem', color: '#3a6b45', display: 'flex', gap: '0.5rem', marginTop: '0.1rem', fontFamily: 'JetBrains Mono' }}>
                                            <span>{a.date}</span><span>·</span><Clock size={10} /><span>{a.readTime} min read</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.5rem', cursor: 'pointer', lineHeight: 1.3 }} onClick={() => setExpanded(isOpen ? null : a.id)}>{a.title}</h3>
                                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: isOpen ? 100 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt}</p>

                                {/* Expanded body */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.8, marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${ai ? '#00d4ff' : '#00ff41'}` }}>
                                                {a.body || a.excerpt + '\n\n[Full article content would be displayed here with rich text formatting, code blocks, and images.]'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(a.id)} className="cyber-input" placeholder="Leave a comment…" style={{ borderColor: 'rgba(0,212,255,0.15)', fontSize: '0.8rem' }} />
                                                <motion.button whileHover={{ scale: 1.06 }} onClick={() => addComment(a.id)} style={{ padding: '0.5rem 0.85rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px', color: '#00d4ff', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>Post</motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                                    {a.tags.map(t => { const tc = tagColors(t); return <span key={t} style={{ fontSize: '0.6rem', color: tc.c, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '4px', padding: '0.07rem 0.32rem', fontFamily: 'JetBrains Mono' }}>{t}</span> })}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.7rem' }}>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => clap(a.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: myClaps > 0 ? 'rgba(0,255,65,0.08)' : 'none', border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', color: myClaps > 0 ? '#00ff41' : '#3a6b45', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'JetBrains Mono' }}>
                                        👏 {a.claps + myClaps} {myClaps > 0 && `(+${myClaps})`}
                                    </motion.button>
                                    <button onClick={() => setExpanded(isOpen ? null : a.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
                                        <MessageSquare size={12} /> {a.comments}
                                    </button>
                                    <button onClick={() => setBookmarks(b => ({ ...b, [a.id]: !b[a.id] }))} style={{ background: 'none', border: 'none', color: bookmarks[a.id] ? '#f59e0b' : '#3a6b45', cursor: 'pointer', marginLeft: 'auto' }}><Bookmark size={14} /></button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Create Article Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,4,0.92)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                            style={{ background: 'rgba(5,18,8,0.98)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)', borderRadius: '16px 16px 0 0' }} />
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', fontWeight: 800, color: '#e8f5e9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PenTool size={16} style={{ color: '#00d4ff' }} /> Write Article</h2>
                                    <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#3a6b45', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>TITLE</label>
                                        <input className="cyber-input" placeholder="Compelling article title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>EXCERPT / SUMMARY</label>
                                        <textarea className="cyber-input" placeholder="One-paragraph summary that hooks readers…" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'Inter' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>FULL CONTENT</label>
                                        <textarea className="cyber-input" placeholder="Write your full article here (markdown supported)…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ minHeight: '160px', resize: 'vertical', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>DOMAIN</label>
                                            <select className="cyber-input" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={{ fontSize: '0.78rem' }}>
                                                {['AI', 'Cybersecurity', 'Web Dev', 'General'].map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>TAGS</label>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                {['AI Security', 'CTF', 'JWT', 'Machine Learning', 'Privacy', 'Web Security', 'Backend'].map(t => (
                                                    <button key={t} onClick={() => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }))}
                                                        style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: form.tags.includes(t) ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(100,116,139,0.1)', background: form.tags.includes(t) ? 'rgba(0,255,65,0.08)' : 'transparent', color: form.tags.includes(t) ? '#00ff41' : '#3a6b45', fontSize: '0.62rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={publish}
                                        style={{ padding: '0.85rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
                                        PUBLISH ARTICLE
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
