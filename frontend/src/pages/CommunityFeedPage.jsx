import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Code, ThumbsUp, ThumbsDown, Send, Shield, ChevronDown, ChevronUp, Terminal, Brain } from 'lucide-react'
import { useSelector } from 'react-redux'

// Green = Security posts/code  |  Blue = AI/community posts/replies
const THREAT_RULES = [
    { pattern: /(['"])\s*or\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i, cat: 'SQL Injection', level: 'Critical' },
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, cat: 'XSS', level: 'High' },
    { pattern: /password\s*=\s*['"'][^'"]{3,}/i, cat: 'Hardcoded Credential', level: 'Critical' },
    { pattern: /eval\s*\(/i, cat: 'Code Injection', level: 'High' },
    { pattern: /exec\s*\(|os\.system\s*\(|subprocess\.call/i, cat: 'Command Injection', level: 'Critical' },
    { pattern: /\.\.\//i, cat: 'Path Traversal', level: 'High' },
    { pattern: /md5\s*\(|sha1\s*\(/i, cat: 'Weak Crypto', level: 'Medium' },
    { pattern: /jwt\.decode.*verify.*false|algorithm.*none/i, cat: 'JWT None Algorithm', level: 'Critical' },
]
function analyzeThreat(text) {
    const hits = THREAT_RULES.filter(r => r.pattern.test(text))
    if (!hits.length) return { level: 'Clean', score: 0, hits: [] }
    const scores = { Low: 15, Medium: 40, High: 65, Critical: 90 }
    const max = Math.max(...hits.map(h => scores[h.level]))
    return { level: hits.find(h => scores[h.level] === max).level, score: max, hits }
}
const TS = {
    Clean: { color: '#00ff41', bg: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.25)', icon: '✅' },
    Low: { color: '#00ff41', bg: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.25)', icon: '🟢' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '🟡' },
    High: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', icon: '🔶' },
    Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '🚨' },
}

// Domain → color for post author avatars
function avatarGrad(domain) {
    const ai = ['AI', 'ML', 'Data Science', 'Web3']
    if (ai.includes(domain)) return 'linear-gradient(135deg,#00d4ff,#0099cc)'
    return 'linear-gradient(135deg,#00ff41,#00c853)'
}

// Domain tag color  
function domainTag(domain) {
    const ai = ['AI', 'ML', 'Data Science', 'Web3']
    return ai.includes(domain)
        ? { color: '#00d4ff', bg: 'rgba(0,212,255,0.07)', border: 'rgba(0,212,255,0.18)' }
        : { color: '#00ff41', bg: 'rgba(0,255,65,0.07)', border: 'rgba(0,255,65,0.18)' }
}

const INIT_POSTS = [
    {
        id: 1, author: 'Arya Sharma', av: 'AS', domain: 'Cybersecurity', time: '2h ago',
        content: 'Solved the JWT none-algorithm challenge in CyberCTF! Key insight: always validate the alg header before decoding. Here\'s the PoC:',
        code: "// ❌ Vulnerable — never do this!\nconst decoded = jwt.decode(token, { algorithms: ['none'] })\n\n// ✅ Secure\nconst decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] })",
        up: 34, dn: 1, replies: [{ id: 101, author: 'Ravi Nair', content: 'Great find! Also check for alg confusion attacks between RS256 and HS256.', time: '1h ago', domain: 'AI' }],
        threat: { level: 'Critical', score: 90, hits: [{ cat: 'JWT None Algorithm' }] }
    },
    {
        id: 2, author: 'Ravi Nair', av: 'RN', domain: 'AI', time: '4h ago',
        content: 'Trained an adversarial detection model achieving 94.7% accuracy on MNIST-C. Key: ensemble of autoencoders + Mahalanobis distance for anomaly scoring.',
        code: null, up: 52, dn: 3, replies: [], threat: null
    },
    {
        id: 3, author: 'Priya Mehta', av: 'PM', domain: 'Security', time: '6h ago',
        content: 'PSA: Found many FastAPI apps exposing /docs with no auth in prod. Always protect your OpenAPI endpoint!',
        code: "# Disable docs in production — main.py\napp = FastAPI(\n  docs_url=None if os.getenv('ENV') == 'prod' else '/docs',\n  redoc_url=None if os.getenv('ENV') == 'prod' else '/redoc'\n)",
        up: 78, dn: 0, replies: [], threat: null
    },
]

export default function CommunityFeedPage() {
    const { user } = useSelector(s => s.auth)
    const [posts, setPosts] = useState(INIT_POSTS)
    const [text, setText] = useState('')
    const [code, setCode] = useState('')
    const [showCode, setShowCode] = useState(false)
    const [threatRes, setThreatRes] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [expanded, setExpanded] = useState(null)
    const [reply, setReply] = useState('')

    const handlePost = () => {
        if (!text.trim()) return
        setScanning(true)
        setTimeout(() => {
            const threat = analyzeThreat(text + code)
            setThreatRes(threat)
            setPosts(p => [{
                id: Date.now(), author: user?.name || 'Anonymous',
                av: user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AN',
                domain: user?.domain || 'General', time: 'just now',
                content: text, code: code || null, up: 0, dn: 0, replies: [],
                threat: threat.level !== 'Clean' ? threat : null,
            }, ...p])
            setText(''); setCode(''); setShowCode(false); setScanning(false)
        }, 1200)
    }

    const vote = (id, dir) => setPosts(ps => ps.map(p => p.id === id ? { ...p, [dir === 'up' ? 'up' : 'dn']: p[dir === 'up' ? 'up' : 'dn'] + 1 } : p))
    const addReply = (postId) => {
        if (!reply.trim()) return
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: Date.now(), author: user?.name || 'Anonymous', content: reply, time: 'just now', domain: user?.domain || 'General' }] } : p))
        setReply('')
    }

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5 }} />
            <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ─ Header ─ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        {/* Blue icon — community = AI/social */}
                        <MessageSquare size={24} style={{ color: '#00d4ff' }} />
                        <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9' }}>
                            Command <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Feed</span>
                        </h1>
                    </div>
                    <p style={{ color: '#3a6b45', fontSize: '0.88rem' }}>
                        Share insights, code, and discoveries. <span style={{ color: '#00ff41' }}>🛡️ AI threat-scans every post.</span>
                    </p>
                </motion.div>

                {/* ─ Composer ─ */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    style={{ background: 'rgba(0,5,15,0.88)', border: '1px solid rgba(0,212,255,0.18)', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' }}>
                    {/* Top bar — blue border (community action) */}
                    <div style={{ height: '2px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)', borderRadius: '14px 14px 0 0', marginTop: '-1.5rem', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        {/* Your avatar — use domain color */}
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarGrad(user?.domain || 'Cybersecurity'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#020d04', flexShrink: 0, boxShadow: '0 0 10px rgba(0,255,65,0.3)' }}>
                            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'OP'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share a finding, insight, writeup, or ask the community…"
                                className="cyber-input" style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'Inter', borderColor: 'rgba(0,212,255,0.15)' }} />
                            <AnimatePresence>
                                {showCode && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '0.75rem' }}>
                                        <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="// Paste code snippet here…"
                                            className="cyber-input" style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', borderColor: 'rgba(0,255,65,0.15)' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Code toggle — green (code = security/terminal tool) */}
                                    <button onClick={() => setShowCode(!showCode)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: showCode ? 'rgba(0,255,65,0.1)' : 'transparent', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '6px', padding: '0.32rem 0.65rem', color: '#00ff41', cursor: 'pointer', fontSize: '0.76rem' }}>
                                        <Code size={12} /> Code
                                    </button>
                                    {/* Threat scan badge — green (security system) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#00ff41', background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '6px', padding: '0.3rem 0.6rem' }}>
                                        <Shield size={11} /> AI Threat Scan: <strong>Active</strong>
                                    </div>
                                </div>
                                {/* Post button — green→blue gradient (main action) */}
                                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(0,255,65,0.25),0 0 50px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.96 }}
                                    onClick={handlePost} disabled={scanning || !text.trim()}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.52rem 1.2rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '7px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.76rem', cursor: 'pointer', letterSpacing: '0.05em', opacity: !text.trim() ? 0.5 : 1 }}>
                                    {scanning ? '⟳ Scanning…' : <><Send size={12} /> POST</>}
                                </motion.button>
                            </div>
                            {/* Threat result */}
                            <AnimatePresence>
                                {threatRes && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: TS[threatRes.level]?.bg, border: `1px solid ${TS[threatRes.level]?.border}`, borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            <Shield size={13} style={{ color: TS[threatRes.level]?.color }} />
                                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: TS[threatRes.level]?.color, fontWeight: 700 }}>
                                                THREAT LEVEL: {threatRes.level.toUpperCase()} ({threatRes.score}/100)
                                            </span>
                                        </div>
                                        {threatRes.hits.map(h => <div key={h.cat} style={{ fontSize: '0.76rem', color: '#e8f5e9', marginBottom: '0.15rem' }}>⚠ {h.cat}</div>)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* ─ Posts ─ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {posts.map((post, i) => {
                        const dtag = domainTag(post.domain)
                        const avGrad = avatarGrad(post.domain)
                        const isAI = ['AI', 'ML', 'Data Science', 'Web3'].includes(post.domain)
                        const cardBorder = isAI ? 'rgba(0,212,255,0.1)' : 'rgba(0,255,65,0.1)'
                        const open = expanded === post.id
                        return (
                            <motion.div key={post.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                style={{ background: isAI ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: `1px solid ${cardBorder}`, borderRadius: '13px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                                {/* Side accent bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, background: isAI ? 'linear-gradient(180deg,#00d4ff,transparent)' : 'linear-gradient(180deg,#00ff41,transparent)', borderRadius: '13px 0 0 13px' }} />

                                {/* Post header */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.73rem', fontWeight: 700, color: '#020d04', flexShrink: 0, boxShadow: `0 0 10px ${isAI ? 'rgba(0,212,255,0.25)' : 'rgba(0,255,65,0.25)'}` }}>
                                        {post.av}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, color: '#e8f5e9', fontSize: '0.88rem' }}>{post.author}</span>
                                            <span style={{ fontSize: '0.62rem', color: dtag.color, background: dtag.bg, border: `1px solid ${dtag.border}`, borderRadius: '4px', padding: '0.08rem 0.35rem', fontFamily: 'JetBrains Mono' }}>{post.domain}</span>
                                            {/* Threat badge */}
                                            {post.threat && (
                                                <span style={{ fontSize: '0.62rem', color: TS[post.threat.level]?.color, background: TS[post.threat.level]?.bg, border: `1px solid ${TS[post.threat.level]?.border}`, borderRadius: '4px', padding: '0.08rem 0.35rem', fontFamily: 'JetBrains Mono' }}>
                                                    {TS[post.threat.level]?.icon} {post.threat.level} Risk
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#3a6b45', marginTop: '0.1rem' }}>{post.time}</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <p style={{ fontSize: '0.87rem', color: '#cbd5e1', lineHeight: 1.75, marginBottom: post.code ? '0.75rem' : '1rem' }}>{post.content}</p>

                                {/* Code block — always green terminal style */}
                                {post.code && (
                                    <div style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1rem', overflowX: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                            <Terminal size={11} style={{ color: '#00ff41' }} />
                                            <span style={{ fontSize: '0.6rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>code</span>
                                        </div>
                                        <pre style={{ fontFamily: 'JetBrains Mono', fontSize: '0.76rem', color: '#86efac', margin: 0, whiteSpace: 'pre-wrap' }}>{post.code}</pre>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: `1px solid ${isAI ? 'rgba(0,212,255,0.07)' : 'rgba(0,255,65,0.07)'}`, paddingTop: '0.75rem' }}>
                                    {/* Upvote — green (positive engagement = system health) */}
                                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => vote(post.id, 'up')}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'JetBrains Mono' }}>
                                        <ThumbsUp size={14} /> {post.up}
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => vote(post.id, 'dn')}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'JetBrains Mono' }}>
                                        <ThumbsDown size={14} /> {post.dn}
                                    </motion.button>
                                    {/* Reply — blue (discussion = AI/community) */}
                                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setExpanded(open ? null : post.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'JetBrains Mono', marginLeft: 'auto' }}>
                                        <MessageSquare size={13} /> {post.replies.length} replies {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    </motion.button>
                                </div>

                                {/* Replies */}
                                <AnimatePresence>
                                    {open && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            style={{ marginTop: '0.9rem', borderTop: '1px solid rgba(0,212,255,0.07)', paddingTop: '0.9rem' }}>
                                            {post.replies.map(r => {
                                                const rAI = ['AI', 'ML', 'Data Science', 'Web3'].includes(r.domain)
                                                return (
                                                    <div key={r.id} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.65rem' }}>
                                                        {/* Reply avatar — blue background (community discussion) */}
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: rAI ? 'rgba(0,212,255,0.2)' : 'rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: rAI ? '#00d4ff' : '#00ff41', flexShrink: 0, border: `1px solid ${rAI ? 'rgba(0,212,255,0.25)' : 'rgba(0,255,65,0.2)'}` }}>
                                                            {r.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.55rem 0.75rem', flex: 1, border: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.76rem' }}>{r.author}</span>
                                                            <span style={{ fontSize: '0.62rem', color: '#3a6b45', marginLeft: '0.5rem' }}>{r.time}</span>
                                                            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem', lineHeight: 1.6 }}>{r.content}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {/* Reply input — blue send button (community action) */}
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(post.id)}
                                                    className="cyber-input" placeholder="Write a reply…" style={{ fontSize: '0.8rem', borderColor: 'rgba(0,212,255,0.15)' }} />
                                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => addReply(post.id)}
                                                    style={{ padding: '0.5rem 0.85rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px', color: '#00d4ff', cursor: 'pointer', flexShrink: 0 }}>
                                                    <Send size={14} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
