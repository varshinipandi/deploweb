import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Brain, Plus, X, Crown, Shield, Zap, ChevronRight, Check, UserPlus } from 'lucide-react'
import { useSelector } from 'react-redux'

// Green = security-focus teams | Blue = AI/ML/community teams | Gradient = Create/Scan actions
const TEAMS = [
    { id: 1, name: 'Zero Day Crafters', desc: 'Elite red-team crew specializing in zero-day research and responsible disclosure programs.', members: [{ n: 'Arya S', av: 'AS', role: 'leader', domain: 'Cybersecurity' }, { n: 'Kiran D', av: 'KD', role: 'member', domain: 'Cybersecurity' }, { n: 'Meera P', av: 'MP', role: 'member', domain: 'AI' }], maxMembers: 5, event: 'CyberCTF Spring', score: 94, tags: ['CTF', 'Cybersecurity'], type: 'security' },
    { id: 2, name: 'Neural Defenders', desc: 'Building adversarial ML defenses and AI-powered anomaly detection pipelines for cloud infrastructure.', members: [{ n: 'Ravi N', av: 'RN', role: 'leader', domain: 'AI' }, { n: 'Priya M', av: 'PM', role: 'member', domain: 'Full Stack' }], maxMembers: 4, event: 'HackAI 2026', score: 88, tags: ['AI', 'ML'], type: 'ai' },
    { id: 3, name: 'OSINT Operators', desc: 'Intelligence gathering and threat attribution for CTF forensics and national security competitions.', members: [{ n: 'Sana Q', av: 'SQ', role: 'leader', domain: 'Cybersecurity' }, { n: 'Deepak R', av: 'DR', role: 'member', domain: 'DevSecOps' }, { n: 'Yash T', av: 'YT', role: 'member', domain: 'Web3' }], maxMembers: 4, event: 'OSINT Masterclass', score: 76, tags: ['CTF', 'Cybersecurity'], type: 'security' },
    { id: 4, name: 'Quantum AI Labs', desc: 'Research team at the intersection of quantum computing, federated learning, and privacy-preserving AI.', members: [{ n: 'Meera P', av: 'MP', role: 'leader', domain: 'AI' }], maxMembers: 5, event: 'ML Security Workshop', score: 71, tags: ['AI', 'ML', 'Web3'], type: 'ai' },
    { id: 5, name: 'BugSmiths', desc: 'Bug bounty hunters focused on web app vulnerabilities, API security, and CVE documentation.', members: [{ n: 'Kiran D', av: 'KD', role: 'leader', domain: 'Cybersecurity' }, { n: 'Arya S', av: 'AS', role: 'member', domain: 'Cybersecurity' }], maxMembers: 4, event: 'Hardware Hacking Jam', score: 65, tags: ['Cybersecurity', 'CTF'], type: 'security' },
]

const EVENTS = ['HackAI 2026', 'CyberCTF Spring', 'ML Security Workshop', 'Web3 Security Deep Dive', 'Open Source AI Sprint', 'Hardware Hacking Jam']
const ALL_MEMBERS = ['Arya S (AS)', 'Ravi N (RN)', 'Priya M (PM)', 'Kiran D (KD)', 'Sana Q (SQ)', 'Deepak R (DR)', 'Meera P (MP)', 'Yash T (YT)']
const DOMAINS = ['Cybersecurity', 'AI', 'Full Stack', 'Data Science', 'DevSecOps', 'Web3', 'ML']

function teamColors(type) {
    return type === 'ai'
        ? { primary: '#00d4ff', secondary: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)', cardBg: 'rgba(0,5,20,0.85)', glowBar: 'linear-gradient(180deg,#00d4ff,transparent)' }
        : { primary: '#00ff41', secondary: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.2)', cardBg: 'rgba(5,18,8,0.85)', glowBar: 'linear-gradient(180deg,#00ff41,transparent)' }
}
function memberAvatarColor(domain) {
    const ai = ['AI', 'ML', 'Data Science', 'Web3']
    return ai.includes(domain) ? { grad: 'linear-gradient(135deg,#00d4ff,#0099cc)', glow: 'rgba(0,212,255,0.3)' } : { grad: 'linear-gradient(135deg,#00ff41,#00c853)', glow: 'rgba(0,255,65,0.3)' }
}

// Compatibility Engine (AI = blue) 
function computeScore(selected) {
    const domains = selected.map(s => DOMAINS[Math.floor(Math.random() * DOMAINS.length)])
    const unique = new Set(domains).size
    const base = 50 + unique * 8 + selected.length * 6
    return Math.min(base + Math.floor(Math.random() * 10), 99)
}

function ScoreRing({ score, color }) {
    const r = 32, circ = 2 * Math.PI * r
    const fill = (score / 100) * circ
    return (
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - fill }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
        </svg>
    )
}

export default function TeamsPage() {
    const { user } = useSelector(s => s.auth)
    const [showCreate, setShowCreate] = useState(false)
    const [selected, setSelected] = useState(null)
    const [requests, setRequests] = useState({})
    const [form, setForm] = useState({ name: '', desc: '', event: '', members: [] })
    const [compatSelected, setCompatSelected] = useState([])
    const [compatScore, setCompatScore] = useState(null)
    const [scanning, setScanning] = useState(false)

    const runScan = () => {
        if (compatSelected.length < 2) return
        setScanning(true)
        setTimeout(() => { setCompatScore(computeScore(compatSelected)); setScanning(false) }, 1400)
    }
    const requestJoin = (teamId) => { setRequests(r => ({ ...r, [teamId]: 'pending' })) }
    const toggleMember = (m) => setCompatSelected(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m])

    const selectedTeam = TEAMS.find(t => t.id === selected)

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5 }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ─ Header ─ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9', marginBottom: '0.25rem' }}>
                            Squad <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Formation</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            <span style={{ color: '#00ff41' }}>Green</span> = Security teams · <span style={{ color: '#00d4ff' }}>Blue</span> = AI teams · Click a card to manage
                        </p>
                    </div>
                    {/* Create Team — gradient (key action = both worlds) */}
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,65,0.3),0 0 60px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => setShowCreate(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                        <Plus size={15} /> CREATE TEAM
                    </motion.button>
                </motion.div>

                {/* ─ AI Compatibility Engine ─ */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    style={{ marginBottom: '2rem', background: 'rgba(0,5,20,0.9)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '14px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Blue top bar — AI module */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#00d4ff,transparent)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <Brain size={18} style={{ color: '#00d4ff' }} />
                        <span style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 700, color: '#00d4ff' }}>AI Compatibility Engine</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '4px', padding: '0.08rem 0.38rem', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>POWERED BY AI</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Select 2+ members to get an AI compatibility score based on domain diversity and skill coverage.</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {ALL_MEMBERS.map(m => {
                            const sel = compatSelected.includes(m)
                            return (
                                <motion.button key={m} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => toggleMember(m)}
                                    style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', border: sel ? '1px solid rgba(0,255,65,0.5)' : '1px solid rgba(255,255,255,0.06)', background: sel ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.3)', color: sel ? '#00ff41' : '#64748b', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                    {sel && <Check size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />}{m}
                                </motion.button>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Run Scan — gradient CTA */}
                        <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(0,255,65,0.25),0 0 40px rgba(0,212,255,0.12)' }} whileTap={{ scale: 0.96 }}
                            onClick={runScan} disabled={compatSelected.length < 2}
                            style={{ padding: '0.55rem 1.2rem', background: compatSelected.length >= 2 ? 'linear-gradient(135deg,#00ff41,#00d4ff)' : 'rgba(0,0,0,0.3)', border: compatSelected.length >= 2 ? 'none' : '1px solid rgba(100,116,139,0.1)', borderRadius: '7px', color: compatSelected.length >= 2 ? '#020d04' : '#64748b', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.76rem', cursor: compatSelected.length >= 2 ? 'pointer' : 'not-allowed', letterSpacing: '0.04em' }}>
                            {scanning ? '⟳ SCANNING…' : '⚡ RUN SCAN'}
                        </motion.button>
                        {compatScore !== null && !scanning && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    <ScoreRing score={compatScore} color={compatScore >= 80 ? '#00ff41' : '#00d4ff'} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1rem', color: compatScore >= 80 ? '#00ff41' : '#00d4ff' }}>{compatScore}</span>
                                        <span style={{ fontSize: '0.52rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>SCORE</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: compatScore >= 80 ? '#00ff41' : '#00d4ff', fontSize: '0.88rem' }}>
                                        {compatScore >= 85 ? 'Excellent Match!' : compatScore >= 70 ? 'Good Compatibility' : 'Average Match'}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: '0.15rem' }}>Domain Coverage · Skill Overlap · Balance</div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* ─ Teams grid ─ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
                    {TEAMS.map((team, i) => {
                        const col = teamColors(team.type)
                        const open = selected === team.id
                        const myReq = requests[team.id]
                        const full = team.members.length >= team.maxMembers
                        return (
                            <motion.div key={team.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelected(open ? null : team.id)}
                                style={{ background: col.cardBg, border: `1px solid ${col.border}`, borderRadius: '12px', padding: '1.4rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                                {/* Side accent bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, background: col.glowBar, borderRadius: '12px 0 0 12px' }} />

                                {/* Score ring + info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                                    <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            {team.tags.map(t => <span key={t} style={{ fontSize: '0.6rem', color: col.primary, background: col.secondary, border: `1px solid ${col.border}`, borderRadius: '3px', padding: '0.07rem 0.3rem', fontFamily: 'JetBrains Mono' }}>#{t}</span>)}
                                        </div>
                                        <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.35rem' }}>{team.name}</h3>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{team.desc}</p>
                                    </div>
                                    <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                                        <ScoreRing score={team.score} color={col.primary} />
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '0.88rem', color: col.primary }}>{team.score}</span>
                                            <span style={{ fontSize: '0.46rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>SCORE</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Members */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                                    {team.members.map(m => {
                                        const mc = memberAvatarColor(m.domain)
                                        return (
                                            <div key={m.av} style={{ position: 'relative' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: mc.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#020d04', border: `2px solid #020d04`, boxShadow: `0 0 8px ${mc.glow}` }}>
                                                    {m.av}
                                                </div>
                                                {m.role === 'leader' && (
                                                    <Crown size={9} style={{ position: 'absolute', top: '-4px', right: '-3px', color: '#f59e0b', filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.6))' }} />
                                                )}
                                            </div>
                                        )
                                    })}
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginLeft: '0.2rem' }}>
                                        {team.members.length}/{team.maxMembers}
                                    </div>
                                </div>

                                {/* Event */}
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Zap size={10} style={{ color: col.primary }} /> {team.event}
                                </div>

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {open && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            style={{ borderTop: `1px solid ${col.border}`, paddingTop: '0.9rem', marginTop: '0.1rem' }} onClick={e => e.stopPropagation()}>
                                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.6rem', letterSpacing: '0.08em' }}>MEMBERS</div>
                                            {team.members.map(m => {
                                                const mc = memberAvatarColor(m.domain)
                                                const isLeader = m.role === 'leader'
                                                const dTag = ['AI', 'ML', 'Data Science', 'Web3'].includes(m.domain)
                                                return (
                                                    <div key={m.av} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: mc.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#020d04' }}>{m.av}</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.78rem', color: '#e8f5e9', fontWeight: 600 }}>{m.n}</div>
                                                            <div style={{ fontSize: '0.62rem', color: dTag ? '#00d4ff' : '#00ff41', fontFamily: 'JetBrains Mono' }}>{m.domain}</div>
                                                        </div>
                                                        {isLeader
                                                            ? <Crown size={13} style={{ color: '#f59e0b' }} />
                                                            : <button onClick={() => { }} style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px', padding: '0.1rem 0.4rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>Remove</button>
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Join Request button — blue (community) */}
                                {!full && !myReq && (
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={e => { e.stopPropagation(); requestJoin(team.id) }}
                                        style={{ width: '100%', padding: '0.55rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px', color: '#00d4ff', fontFamily: 'JetBrains Mono', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
                                        <UserPlus size={13} /> Request to Join
                                    </motion.button>
                                )}
                                {myReq === 'pending' && (
                                    <div style={{ width: '100%', padding: '0.55rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '7px', color: '#f59e0b', fontFamily: 'JetBrains Mono', fontSize: '0.76rem', textAlign: 'center', marginTop: '0.75rem' }}>
                                        ⏳ Request Pending
                                    </div>
                                )}
                                {full && !myReq && (
                                    <div style={{ width: '100%', padding: '0.55rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,116,139,0.1)', borderRadius: '7px', color: '#64748b', fontFamily: 'JetBrains Mono', fontSize: '0.76rem', textAlign: 'center', marginTop: '0.75rem' }}>
                                        Team Full
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* ─ Create Team Modal ─ */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,4,0.9)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                            style={{ background: 'rgba(5,18,8,0.98)', border: '1px solid rgba(0,255,65,0.22)', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
                            <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)', borderRadius: '16px 16px 0 0' }} />
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', fontWeight: 800, color: '#e8f5e9' }}>Create Team</h2>
                                    <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>TEAM NAME</label>
                                        <input className="cyber-input" placeholder="Zero Day Crafters…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>DESCRIPTION</label>
                                        <textarea className="cyber-input" placeholder="What's your team's mission?" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ minHeight: '70px', resize: 'vertical', fontFamily: 'Inter' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>TARGET EVENT</label>
                                        <select className="cyber-input" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                                            <option value="">Select event…</option>
                                            {EVENTS.map(e => <option key={e}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>INVITE MEMBERS</label>
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                            {ALL_MEMBERS.map(m => {
                                                const sel = form.members.includes(m)
                                                return (
                                                    <button key={m} onClick={() => setForm(f => ({ ...f, members: sel ? f.members.filter(x => x !== m) : [...f.members, m] }))}
                                                        style={{ padding: '0.3rem 0.6rem', borderRadius: '5px', border: sel ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(100,116,139,0.1)', background: sel ? 'rgba(0,212,255,0.1)' : 'rgba(0,0,0,0.2)', color: sel ? '#00d4ff' : '#64748b', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                        {sel && <Check size={9} style={{ display: 'inline', marginRight: '0.2rem' }} />}{m}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,255,65,0.25),0 0 60px rgba(0,212,255,0.12)' }} whileTap={{ scale: 0.97 }}
                                        onClick={() => { if (form.name.trim()) setShowCreate(false) }}
                                        style={{ padding: '0.85rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                        LAUNCH TEAM
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
