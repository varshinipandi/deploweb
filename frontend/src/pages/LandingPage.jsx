import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, Trophy, Brain, Terminal, ArrowRight, ChevronRight } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Matrix Rain Canvas  (green chars — security layer)
// ─────────────────────────────────────────────────────────────────────────────
function MatrixCanvas() {
    const ref = useRef(null)
    useEffect(() => {
        const c = ref.current; if (!c) return
        const ctx = c.getContext('2d')
        const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
        resize()
        const cols = Math.floor(c.width / 18)
        const drops = Array(cols).fill(1)
        const chars = '01アイウエオカキクケコサシスセソタチツ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef>#<'
        const draw = () => {
            ctx.fillStyle = 'rgba(2,13,4,0.055)'
            ctx.fillRect(0, 0, c.width, c.height)
            drops.forEach((y, i) => {
                const ch = chars[Math.floor(Math.random() * chars.length)]
                const bright = Math.random() > 0.93
                ctx.font = `${bright ? 'bold ' : ''}13px JetBrains Mono`
                ctx.shadowBlur = bright ? 10 : 0
                ctx.shadowColor = '#00ff41'
                ctx.fillStyle = bright ? '#b2ff59' : '#00ff41'
                ctx.fillText(ch, i * 18, y * 18)
                ctx.shadowBlur = 0
                if (y * 18 > c.height && Math.random() > 0.975) drops[i] = 0
                else drops[i]++
            })
        }
        const id = setInterval(draw, 45)
        window.addEventListener('resize', resize)
        return () => { clearInterval(id); window.removeEventListener('resize', resize) }
    }, [])
    return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.16, pointerEvents: 'none' }} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating orbs — green (bottom-left) + blue (top-right)
// ─────────────────────────────────────────────────────────────────────────────
function DualOrbs() {
    const orbs = [
        { size: 420, l: '-8%', t: '10%', bg: 'radial-gradient(circle, rgba(0,255,65,0.07) 0%, transparent 70%)', an: 'orbFloat1', dur: '14s' },
        { size: 360, l: '72%', t: '55%', bg: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', an: 'orbFloat2', dur: '16s' },
        { size: 250, l: '45%', t: '-8%', bg: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', an: 'orbFloat1', dur: '19s' },
        { size: 180, l: '88%', t: '15%', bg: 'radial-gradient(circle, rgba(0,255,65,0.05) 0%, transparent 70%)', an: 'orbFloat2', dur: '11s' },
        { size: 200, l: '20%', t: '75%', bg: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', an: 'orbFloat1', dur: '17s' },
    ]
    return (
        <>
            {orbs.map((o, i) => (
                <div key={i} style={{ position: 'fixed', left: o.l, top: o.t, width: o.size, height: o.size, borderRadius: '50%', background: o.bg, animation: `${o.an} ${o.dur} ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
            ))}
        </>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scan lines
// ─────────────────────────────────────────────────────────────────────────────
const ScanLines = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.012) 2px, rgba(0,255,65,0.012) 4px)', opacity: 0.7 }} />
)

// ─────────────────────────────────────────────────────────────────────────────
// MATRIX DECODE heading — "Headquarters"
// Each letter scrambles through Matrix chars, then locks onto the real letter
// Scramble = green (#00ff41), settled = electric blue (#00d4ff) with glow
// ─────────────────────────────────────────────────────────────────────────────
const DECODE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキ#@$%&*'

function MatrixDecodeText({ text, triggerOnMount = true, interval = 50, baseDelay = 120 }) {
    const [letterStates, setLetterStates] = useState(() =>
        text.split('').map(c => ({ display: c === ' ' ? ' ' : DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)], settled: c === ' ' }))
    )

    const run = useCallback(() => {
        const timers = text.split('').map((targetChar, idx) => {
            if (targetChar === ' ') return null
            let count = 0
            const maxCount = 6 + idx * 3   // stagger: later letters take longer
            const startDelay = idx * baseDelay
            return setTimeout(() => {
                const t = setInterval(() => {
                    if (count >= maxCount) {
                        setLetterStates(prev => {
                            const n = [...prev]
                            n[idx] = { display: targetChar, settled: true }
                            return n
                        })
                        clearInterval(t)
                    } else {
                        setLetterStates(prev => {
                            const n = [...prev]
                            n[idx] = { display: DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)], settled: false }
                            return n
                        })
                        count++
                    }
                }, interval)
            }, startDelay)
        })
        return () => timers.forEach(t => { if (t) clearTimeout(t) })
    }, [text, baseDelay, interval])

    useEffect(() => {
        if (!triggerOnMount) return
        // First run after mount
        const cleanup = run()
        // Re-run every 9s to keep the Matrix effect alive
        const loop = setInterval(() => {
            setLetterStates(text.split('').map(c => ({
                display: c === ' ' ? ' ' : DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)],
                settled: c === ' '
            })))
            run()
        }, 9000)
        return () => { cleanup(); clearInterval(loop) }
    }, [run, text])

    return (
        <span>
            {letterStates.map((ls, i) => (
                <span key={i} style={{
                    color: ls.settled ? '#00d4ff' : '#00ff41',
                    textShadow: ls.settled
                        ? '0 0 20px rgba(0,212,255,0.8), 0 0 60px rgba(0,212,255,0.4)'
                        : '0 0 8px rgba(0,255,65,0.6)',
                    transition: ls.settled ? 'color 0.25s ease, text-shadow 0.4s ease' : 'none',
                    fontVariantNumeric: 'tabular-nums',
                }}>{ls.display}</span>
            ))}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter (green — terminal feel)
// ─────────────────────────────────────────────────────────────────────────────
const TAGLINES = ['BUILD.', 'HACK.', 'SECURE.', 'LEAD.']
function Typewriter() {
    const [idx, setIdx] = useState(0)
    const [text, setText] = useState('')
    const [del, setDel] = useState(false)
    useEffect(() => {
        const tgt = TAGLINES[idx]
        let t
        if (!del && text.length < tgt.length) t = setTimeout(() => setText(tgt.slice(0, text.length + 1)), 95)
        else if (!del) t = setTimeout(() => setDel(true), 1500)
        else if (del && text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 50)
        else { setDel(false); setIdx(i => (i + 1) % TAGLINES.length) }
        return () => clearTimeout(t)
    }, [text, del, idx])
    return (
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(0.9rem, 2.2vw, 1.2rem)', color: '#00ff41', letterSpacing: '0.22em', fontWeight: 700, textShadow: '0 0 12px rgba(0,255,65,0.5)' }}>
            {text}<span className="cursor-blink" style={{ color: '#00ff41' }}>█</span>
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Event ticker
// ─────────────────────────────────────────────────────────────────────────────
const TICKS = [
    '⚡ HackAI 2026 — Registration Open · $10K Prize Pool',
    '🛡️ CyberCTF Spring — 50+ Challenges · Mar 20-21',
    '🧠 ML Security Workshop — Mar 15 · Limited Spots',
    '💰 Bug Bounty Sprint — $5K Total Rewards',
    '🌐 Web3 Security Challenge — Apr 1-7 · 5 ETH Prize',
]

// ─────────────────────────────────────────────────────────────────────────────
// Features — green = security / blue = AI
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: Shield, title: 'Threat Analyzer', desc: '10-rule OWASP engine detects SQLi, XSS, JWT exploits, command injection & more in real-time.', color: '#00ff41', tag: 'LIVE NOW', route: '/threat-analyzer', type: 'green' },
    { icon: Brain, title: 'AI Compatibility', desc: 'Vector-scoring algorithm matches you with optimal teammates by skill coverage × domain diversity.', color: '#00d4ff', tag: 'AI-POWERED', route: '/teams', type: 'blue' },
    { icon: Trophy, title: 'Live Leaderboard', desc: 'Real-time rank updates via WebSocket. Bronze → Platinum tier progression with badge rewards.', color: '#00ff41', tag: 'COMPETITIVE', route: '/leaderboard', type: 'green' },
    { icon: Terminal, title: 'ARIA Chatbot', desc: '9-category cybersecurity knowledge base. Ask OWASP, CTF tips, event info, or team strategy.', color: '#00d4ff', tag: 'SMART AI', route: null, type: 'blue' },
    { icon: Zap, title: 'Events Hub', desc: 'Live / Upcoming / Past events with AI recommendations, countdown timers, and in-platform registration.', color: '#00ff41', tag: 'MISSION CONTROL', route: '/events', type: 'green' },
    { icon: Users, title: 'Team Formation', desc: 'Create teams, send join requests, let our AI compatibility engine assemble the perfect squad.', color: '#00d4ff', tag: 'COLLABORATIVE', route: '/teams', type: 'blue' },
]

const STATS = [
    { value: '1,200+', label: 'Members', color: '#00ff41' },
    { value: '50+', label: 'Events', color: '#00d4ff' },
    { value: '120+', label: 'Teams Formed', color: '#00ff41' },
    { value: '$40K+', label: 'Prizes Awarded', color: '#00d4ff' },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div style={{ minHeight: '100vh', background: '#020d04', overflow: 'hidden', position: 'relative' }}>
            <MatrixCanvas />
            <DualOrbs />
            <ScanLines />
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.6 }} />

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem', paddingTop: '90px' }}>

                {/* Badge */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1.2rem', background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: '30px', marginBottom: '2.2rem', backdropFilter: 'blur(10px)' }}
                >
                    <span className="pulse-glow" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 8px #00ff41', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#00ff41', letterSpacing: '0.14em' }}>⚡ AI × CYBERSECURITY COMMAND CENTER</span>
                </motion.div>

                {/* Main heading */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
                    {/* "Digital" — static white with slight green tint */}
                    <div style={{ fontFamily: 'Orbitron', fontSize: 'clamp(2.6rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                        <span style={{ color: '#e8f5e9', textShadow: '0 0 40px rgba(0,255,65,0.08)' }}>Digital</span>
                    </div>

                    {/* "Headquarters" — Matrix decode: scrambles green → settles blue */}
                    <div style={{ fontFamily: 'Orbitron', fontSize: 'clamp(2.6rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                        <MatrixDecodeText text="Headquarters" />
                    </div>
                </motion.div>

                {/* Typewriter */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ marginBottom: '1.6rem', height: '2rem' }}>
                    <Typewriter />
                </motion.div>

                {/* Subtitle */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                    style={{ maxWidth: '560px', textAlign: 'center', fontSize: 'clamp(0.88rem, 2vw, 1rem)', color: '#3a6b45', lineHeight: 1.85, marginBottom: '2.5rem' }}
                >
                    The centralized command center where AI engineers and cybersecurity experts collaborate, compete, and grow.{' '}
                    <span style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.4)' }}>No digital gravity holding you back.</span>
                </motion.p>

                {/* CTAs — gradient green→blue on primary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}
                >
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,212,255,0.25)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/login')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2.2rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.06em', cursor: 'pointer' }}
                    >
                        <Zap size={16} /> ENTER THE DIGITAL HQ
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/events')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2.2rem', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: '#00d4ff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
                    >
                        BROWSE EVENTS <ChevronRight size={14} />
                    </motion.button>
                </motion.div>

                {/* Stats — alternating green / blue */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: '680px' }}
                >
                    {STATS.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '1.1rem 0.5rem', background: '#020d04', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <div style={{ fontFamily: 'Orbitron', fontSize: 'clamp(1rem,2.5vw,1.3rem)', fontWeight: 900, color: s.color, textShadow: `0 0 16px ${s.color}55` }}>{s.value}</div>
                            <div style={{ fontSize: '0.62rem', color: '#2d5230', marginTop: '0.2rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll hint */}
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ marginTop: '3rem', opacity: 0.3 }}>
                    <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: '#00ff41' }} />
                </motion.div>
            </section>

            {/* ══ TICKER ═════════════════════════════════════════════════════ */}
            <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(0,255,65,0.1)', borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(0,255,65,0.02)', padding: '0.65rem 0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#020d04', background: '#00ff41', padding: '0.3rem 0.75rem', whiteSpace: 'nowrap', zIndex: 1, fontWeight: 700 }}>⚡ LIVE</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="ticker-content" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#2d5a35' }}>
                            {[...TICKS, ...TICKS].map((e, i) => <span key={i} style={{ marginRight: '4rem' }}>{e}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ FEATURES ═══════════════════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 2, padding: '5rem 1.5rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#3a6b45', letterSpacing: '0.22em', marginBottom: '0.75rem' }}>// PLATFORM MODULES</div>
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(1.5rem,4vw,2.3rem)', fontWeight: 800, color: '#e8f5e9' }}>
                        Everything You Need to{' '}
                        <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dominate</span>
                    </h2>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon
                        const isBlue = f.type === 'blue'
                        const borderColor = f.color + '18'
                        const cardBg = isBlue ? 'rgba(0,10,22,0.82)' : 'rgba(10,26,13,0.82)'
                        return (
                            <motion.div key={f.title}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -8, boxShadow: `0 20px 60px ${f.color}16` }}
                                onClick={() => f.route && navigate(f.route)}
                                style={{ padding: '1.75rem', background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', cursor: f.route ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}
                            >
                                {/* Corner arc decoration */}
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '56px', height: '56px', borderLeft: `1px solid ${f.color}20`, borderBottom: `1px solid ${f.color}20`, borderRadius: '0 0 0 56px' }} />

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${f.color}10`, border: `1px solid ${f.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={20} style={{ color: f.color }} />
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: '#e8f5e9', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{f.title}</div>
                                        <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono', color: f.color, background: `${f.color}10`, border: `1px solid ${f.color}22`, borderRadius: '4px', padding: '0.1rem 0.42rem', letterSpacing: '0.08em' }}>{f.tag}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#3a6b45', lineHeight: 1.72 }}>{f.desc}</p>
                                {/* Bottom line — green or blue */}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${f.color}45, transparent)` }} />
                            </motion.div>
                        )
                    })}
                </div>
            </section>

            {/* ══ TERMINAL SECTION ═══════════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 2, padding: '2rem 1.5rem 5rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(5,18,8,0.95)', border: '1px solid rgba(0,255,65,0.18)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,255,65,0.06), 0 0 100px rgba(0,212,255,0.04)' }}
                >
                    {/* Terminal chrome */}
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,255,65,0.04)', borderBottom: '1px solid rgba(0,255,65,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef5350' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffeb3b' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e676' }} />
                        <span style={{ marginLeft: '0.5rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#2d5a35' }}>sys@digitalhq:~$</span>
                    </div>
                    <div style={{ padding: '1.5rem', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', lineHeight: 2 }}>
                        {[
                            { cmd: 'join_hq --year 2026', color: '#00ff41', prefix: '> ' },
                            { cmd: '✓ Community: 1,200+ members active', color: '#2d5a35', prefix: '  ' },
                            { cmd: '✓ Security: OWASP-aligned · JWT · bcrypt · Rate-limited', color: '#2d5a35', prefix: '  ' },
                            { cmd: '✓ AI: ARIA Chatbot · Threat Analyzer · Compatibility Engine', color: '#00d4ff', prefix: '  ', dim: '55' },
                            { cmd: '✓ Modules: Events · Teams · Leaderboard · Feed · Profile', color: '#2d5a35', prefix: '  ' },
                            { cmd: 'Status: READY — antigravity∞', color: '#00ff41', prefix: '> ' },
                        ].map((l, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <span style={{ color: '#1a3520' }}>{l.prefix}</span>
                                <span style={{ color: l.color }}>{l.cmd}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ══ FINAL CTA ══════════════════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 2, padding: '5rem 1.5rem 6rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#3a6b45', letterSpacing: '0.2em', marginBottom: '1rem' }}>// TAKE ACTION</div>
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: '#e8f5e9', marginBottom: '1rem' }}>
                        Ready to{' '}
                        <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Go?</span>
                    </h2>
                    <p style={{ color: '#3a6b45', maxWidth: '480px', margin: '0 auto 2.2rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Join the community eliminating digital gravity from AI × Cybersecurity collaboration.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(0,255,65,0.4), 0 0 80px rgba(0,212,255,0.3)' }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/signup')}
                            style={{ padding: '1rem 3rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.06em', cursor: 'pointer' }}
                        >JOIN THE HQ — FREE</motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/threat-analyzer')}
                            style={{ padding: '1rem 2rem', background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.3)', borderRadius: '8px', color: '#00ff41', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >TRY THREAT SCAN</motion.button>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
