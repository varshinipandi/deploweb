import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Shield, Zap } from 'lucide-react'

// ARIA knowledge base — answers based on keyword matching
const ARIA_KNOWLEDGE = [
    {
        keywords: ['event', 'events', 'hackathon', 'ctf', 'workshop', 'upcoming'],
        response: "🎯 **Upcoming Events:**\n\n• **HackAI 2026** — Mar 10-12, $10K prize pool\n• **CyberCTF Spring** — Mar 20-21, 50+ challenges\n• **ML Security Workshop** — Mar 15, hands-on session\n• **Web3 Security Challenge** — Apr 1-7, 5 ETH prize\n\nUse the Events page to filter by tags and register!",
    },
    {
        keywords: ['owasp', 'vulnerability', 'sqli', 'injection', 'xss', 'security'],
        response: "🔒 **OWASP Top 10 Quick Guide:**\n\n1. **A01** Broken Access Control\n2. **A02** Cryptographic Failures\n3. **A03** Injection (SQLi, XSS, Command)\n4. **A04** Insecure Design\n5. **A05** Security Misconfiguration\n\n💡 Tip: Use parameterized queries, validate all inputs, and sanitize outputs. Visit the Community Feed to post code for AI threat scanning!",
    },
    {
        keywords: ['jwt', 'token', 'auth', 'authentication', 'login'],
        response: "🔐 **JWT Security Tips:**\n\n• Always verify the signature — never trust unsigned tokens\n• Never use `algorithm: none`\n• Store JWTs in httpOnly cookies, not localStorage in prod\n• Set short expiry (60 min) + refresh tokens\n• Include only necessary claims\n\nOur platform uses HS256 with 60-minute expiry!",
    },
    {
        keywords: ['team', 'teams', 'join', 'compatibility', 'members'],
        response: "👥 **Team Formation Tips:**\n\nUse our **AI Compatibility Engine** to find your optimal squad!\n\nThe algorithm scores:\n- **40%** Domain coverage (AI + Security + Dev)\n- **30%** Skill balance across members\n- **30%** Domain diversity\n\n→ Go to the Teams page, select 2-5 members and hit 'Run Compatibility Scan'!",
    },
    {
        keywords: ['leaderboard', 'score', 'points', 'ranking', 'badge'],
        response: "🏆 **Scoring System:**\n\n```\nEvents × 10\nPosts × 5\nUpvotes × 3\nHackathon Wins × 50\nMentorship × 20\n```\n\n**Tier Thresholds:**\n🥉 Bronze: 0–199\n🥈 Silver: 200–499\n🥇 Gold: 500–999\n💎 Platinum: 1000+\n\n**Badges:** ⚡ Top Innovator | 🛡️ Cyber Defender | 🧠 AI Architect",
    },
    {
        keywords: ['ai', 'machine learning', 'ml', 'model', 'neural'],
        response: "🧠 **AI Security Resources:**\n\n• **Adversarial ML** — Fooling models with crafted inputs\n• **Model Inversion** — Extracting training data from models\n• **Poisoning Attacks** — Corrupting training datasets\n• **Federated Learning** — Privacy-preserving distributed training\n\n💡 Check our Learning Roadmap in your Profile for a structured AI Security path!",
    },
    {
        keywords: ['ctf', 'capture', 'flag', 'challenge'],
        response: "🚩 **CTF Tips from ARIA:**\n\n**Web Exploitation:** Look for SQLi, IDOR, SSRF\n**Crypto:** Analyze padding oracles, RSA with small exponents\n**Reverse Engineering:** Use Ghidra, IDA Free\n**Forensics:** binwalk, Wireshark, steganography tools\n**OSINT:** Maltego, Shodan, recon-ng\n\nPractice at: HackTheBox, TryHackMe, picoCTF!",
    },
    {
        keywords: ['help', 'hi', 'hello', 'hey', 'what can you do', 'who are you'],
        response: "👋 Hello! I'm **ARIA** — AI Response & Intelligence Assistant for Digital HQ!\n\nI can help you with:\n• 🎯 Event information & recommendations\n• 🔒 Cybersecurity concepts & OWASP tips\n• 👥 Team formation strategy\n• 🏆 Leaderboard & scoring system\n• 🧠 AI & ML security topics\n• 🚩 CTF challenge tips\n\nJust ask me anything!",
    },
    {
        keywords: ['deploy', 'vercel', 'render', 'docker', 'hosting'],
        response: "🚀 **Deployment Guide:**\n\n**Frontend → Vercel:**\n```\ncd frontend && npm run build\n# Push to GitHub → Import to Vercel\n```\n\n**Backend → Render:**\n```\n# Create Web Service from /backend\n# Build: pip install -r requirements.txt\n# Start: uvicorn app.main:app --host 0.0.0.0\n```\n\n**Full Stack → Docker Compose:**\n```\ndocker-compose up --build\n```",
    },
]

const THINKING_DOTS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

function getARIAResponse(userMsg) {
    const lower = userMsg.toLowerCase()
    for (const entry of ARIA_KNOWLEDGE) {
        if (entry.keywords.some(k => lower.includes(k))) {
            return entry.response
        }
    }
    return `🤔 Interesting question! I'm still learning about that specific topic.\n\nHere's what I can tell you: Digital HQ is built for **AI × Cybersecurity** professionals. Try asking me about:\n• Events & hackathons\n• Security concepts\n• Team formation\n• CTF tips\n• Scoring & leaderboard`
}

function MessageContent({ text }) {
    // Render markdown-like content
    const lines = text.split('\n')
    return (
        <div style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#e2e8f0' }}>
            {lines.map((line, i) => {
                if (line.startsWith('```') || line.endsWith('```')) return <div key={i} style={{ height: '2px' }} />
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={i} style={{ fontWeight: 700, color: '#00ff41', marginBottom: '0.2rem' }}>{line.replace(/\*\*/g, '')}</div>
                }
                if (line.startsWith('• ') || line.startsWith('• ')) {
                    return <div key={i} style={{ color: '#94a3b8', paddingLeft: '0.5rem', marginBottom: '0.1rem' }}>{line}</div>
                }
                if (/^\d+\./.test(line)) {
                    return <div key={i} style={{ color: '#94a3b8', paddingLeft: '0.5rem', marginBottom: '0.1rem' }}>{line}</div>
                }
                if (line.startsWith('#')) {
                    return <div key={i} style={{ fontWeight: 700, color: '#a7f3c3', marginBottom: '0.25rem' }}>{line.replace(/^#+\s/, '')}</div>
                }
                if (line.trim() === '') return <div key={i} style={{ height: '0.4rem' }} />
                return <div key={i}>{line}</div>
            })}
        </div>
    )
}

const QUICK_PROMPTS = [
    'Upcoming events?',
    'CTF tips',
    'OWASP top 10',
    'Scoring system',
    'Team compatibility',
]

export default function ARIAChatbot() {
    const [open, setOpen] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 0, role: 'aria',
            text: "👋 Hello! I'm **ARIA** — your AI × Cybersecurity assistant.\n\nAsk me about events, security tips, teams, or anything about Digital HQ!",
        },
    ])
    const [input, setInput] = useState('')
    const [thinking, setThinking] = useState(false)
    const [dotIdx, setDotIdx] = useState(0)
    const [unread, setUnread] = useState(0)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (open) {
            setUnread(0)
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
    }, [open, messages])

    useEffect(() => {
        let id
        if (thinking) id = setInterval(() => setDotIdx(d => (d + 1) % THINKING_DOTS.length), 100)
        return () => clearInterval(id)
    }, [thinking])

    const sendMessage = (text) => {
        const userText = (text || input).trim()
        if (!userText) return
        setInput('')
        const userMsg = { id: Date.now(), role: 'user', text: userText }
        setMessages(m => [...m, userMsg])
        setThinking(true)
        setTimeout(() => {
            const response = getARIAResponse(userText)
            setMessages(m => [...m, { id: Date.now() + 1, role: 'aria', text: response }])
            setThinking(false)
            if (!open) setUnread(u => u + 1)
        }, 800 + Math.random() * 700)
    }

    return (
        <>
            {/* Floating launcher button */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, type: 'spring' }}
                style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setOpen(o => !o); setUnread(0) }}
                    style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: open ? 'rgba(239,68,68,0.9)' : 'linear-gradient(135deg, #00c853, #00ff41)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: open ? '0 0 25px rgba(239,68,68,0.5)' : '0 0 30px rgba(0,255,65,0.5)',
                    }}
                >
                    <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3 }}>
                        {open ? <X size={22} style={{ color: 'white' }} /> : <Bot size={22} style={{ color: 'white' }} />}
                    </motion.div>
                </motion.button>

                {/* Unread badge */}
                <AnimatePresence>
                    {unread > 0 && !open && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}
                        >{unread}</motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse ring */}
                {!open && (
                    <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(0,255,65,0.5)', pointerEvents: 'none' }}
                    />
                )}
            </motion.div>

            {/* Chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                            position: 'fixed',
                            bottom: '5.5rem', right: '1.5rem',
                            width: '370px',
                            height: minimized ? '60px' : '500px',
                            zIndex: 9998,
                            background: 'rgba(2,13,4,0.97)',
                            border: '1px solid rgba(0,180,83,0.4)',
                            borderRadius: '16px',
                            boxShadow: '0 0 40px rgba(0,180,83,0.25)',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'height 0.3s ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.1rem', background: 'linear-gradient(135deg, rgba(0,180,83,0.3), rgba(0,255,65,0.1))', borderBottom: '1px solid rgba(0,180,83,0.2)', flexShrink: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#76ff03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={18} style={{ color: '#020d04' }} />
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid #020d04' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>ARIA</div>
                                <div style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Sparkles size={9} /> AI Response & Intelligence Assistant
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => setMinimized(m => !m)} style={{ background: 'none', border: 'none', color: '#4a7a50', cursor: 'pointer', display: 'flex' }}>
                                    {minimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                                </button>
                                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#4a7a50', cursor: 'pointer', display: 'flex' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {!minimized && (
                            <>
                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {messages.map(msg => (
                                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'flex', gap: '0.6rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
                                        >
                                            {msg.role === 'aria' && (
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#76ff03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Bot size={13} style={{ color: '#020d04' }} />
                                                </div>
                                            )}
                                            <div style={{
                                                maxWidth: '82%', padding: '0.65rem 0.9rem', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                background: msg.role === 'user' ? 'linear-gradient(135deg, #00c853, #00ff41)' : 'rgba(10,26,13,0.95)',
                                                border: msg.role === 'user' ? 'none' : '1px solid rgba(0,180,83,0.2)',
                                            }}>
                                                {msg.role === 'user'
                                                    ? <div style={{ fontSize: '0.82rem', color: '#020d04', fontWeight: 600 }}>{msg.text}</div>
                                                    : <MessageContent text={msg.text} />
                                                }
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Thinking indicator */}
                                    {thinking && (
                                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#76ff03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Bot size={13} style={{ color: '#020d04' }} />
                                            </div>
                                            <div style={{ padding: '0.65rem 0.9rem', borderRadius: '12px 12px 12px 2px', background: 'rgba(10,26,13,0.95)', border: '1px solid rgba(0,180,83,0.2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontFamily: 'JetBrains Mono', color: '#00ff41', fontSize: '1rem' }}>{THINKING_DOTS[dotIdx]}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#4a7a50' }}>ARIA is thinking…</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick prompts */}
                                <div style={{ padding: '0 1rem 0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {QUICK_PROMPTS.map(p => (
                                        <button key={p} onClick={() => sendMessage(p)}
                                            style={{ padding: '0.25rem 0.6rem', background: 'rgba(0,180,83,0.1)', border: '1px solid rgba(0,180,83,0.25)', borderRadius: '12px', color: '#a7f3c3', fontSize: '0.68rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >{p}</button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(0,180,83,0.15)', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder="Ask ARIA anything…"
                                        className="cyber-input"
                                        style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                                    />
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()}
                                        style={{ padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg,#00ff41,#76ff03)', border: 'none', borderRadius: '7px', color: '#020d04', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <Send size={14} />
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
