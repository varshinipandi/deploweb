import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Brain, Search, X, Users, Calendar, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'

function getEventColor(type, tags = []) {
    const isAI = tags.some(t => ['AI', 'ML', 'Web3', 'Data'].includes(t)) || type === 'Hackathon' || type === 'Workshop'
    const isSecurity = tags.some(t => ['Cybersecurity', 'CTF'].includes(t)) || type === 'CTF Challenge'
    if (isSecurity && !tags.includes('AI')) return { primary: '#00ff41', secondary: 'rgba(0,255,65,0.1)', border: 'rgba(0,255,65,0.22)' }
    if (isAI) return { primary: '#00d4ff', secondary: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' }
    return { primary: '#00ff41', secondary: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.15)' }
}

const N = new Date('2026-03-01T14:27:00Z')
const EVENTS = [
    { id: 1, title: 'HackAI 2026', type: 'Hackathon', status: 'upcoming', prize: '$10,000', participants: 234, max: 500, difficulty: 'Intermediate', tags: ['AI', 'Cybersecurity'], date: new Date(N.getTime() + 8 * 86400000), desc: 'Build adversarial AI defenses. 48-hour online hackathon with mentors from Google, Microsoft, and DRDO. Teams of 2–4.', ai: true },
    { id: 2, title: 'CyberCTF Spring', type: 'CTF Challenge', status: 'upcoming', prize: '$5,000', participants: 412, max: 600, difficulty: 'Advanced', tags: ['CTF', 'Cybersecurity'], date: new Date(N.getTime() + 19 * 86400000), desc: '50+ challenges spanning web exploitation, binary analysis, cryptography, and forensics. Solo or team.', ai: false },
    { id: 3, title: 'ML Security Workshop', type: 'Workshop', status: 'upcoming', prize: 'Certificate', participants: 89, max: 150, difficulty: 'Beginner', tags: ['AI', 'ML'], date: new Date(N.getTime() + 14 * 86400000), desc: 'Hands-on: model poisoning, differential privacy, federated learning security. Built for adversarial ML beginners.', ai: true },
    { id: 4, title: 'Web3 Security Deep Dive', type: 'Workshop', status: 'upcoming', prize: '5 ETH', participants: 67, max: 120, difficulty: 'Advanced', tags: ['Web3', 'Cybersecurity'], date: new Date(N.getTime() + 31 * 86400000), desc: 'Smart contract auditing, reentrancy attacks, flash loan exploits. Foundry + Slither toolchain.', ai: false },
    { id: 5, title: 'Open Source AI Sprint', type: 'Hackathon', status: 'upcoming', prize: 'Swag + Certs', participants: 203, max: 400, difficulty: 'Intermediate', tags: ['AI', 'ML'], date: new Date(N.getTime() + 25 * 86400000), desc: 'Contribute to open-source AI security tools. Mentors from Anthropic and Cohere. Best PR merged wins.', ai: true },
    { id: 6, title: 'Hardware Hacking Jam', type: 'CTF Challenge', status: 'upcoming', prize: '$2,500', participants: 55, max: 100, difficulty: 'Advanced', tags: ['CTF', 'Cybersecurity'], date: new Date(N.getTime() + 37 * 86400000), desc: 'JTAG, UART, side-channel attacks on embedded systems. Physical device kit shipped to participants.', ai: false },
    { id: 7, title: 'OSINT Masterclass', type: 'Workshop', status: 'past', prize: 'Certificates', participants: 301, max: 300, difficulty: 'Beginner', tags: ['Cybersecurity', 'AI'], date: new Date(N.getTime() - 13 * 86400000), desc: 'Comprehensive 6-hour OSINT practicum covering Maltego, Shodan, SpiderFoot, recon-ng, and TheHarvester.', ai: false },
    { id: 8, title: 'Network Defense Challenge', type: 'CTF Challenge', status: 'past', prize: '$2,000', participants: 178, max: 250, difficulty: 'Intermediate', tags: ['CTF', 'Cybersecurity'], date: new Date(N.getTime() - 20 * 86400000), desc: 'Blue team vs red team simulation. Defend your network infrastructure against live adversarial attacks.', ai: false },
]

function Countdown({ d: targetDate }) {
    const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
    useEffect(() => {
        const tick = () => { const diff = targetDate - new Date(); if (diff > 0) setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) }) }
        tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
    }, [targetDate])
    return (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[['d', t.d], ['h', t.h], ['m', t.m], ['s', t.s]].map(([l, v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 900, color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.18)', borderRadius: '5px', padding: '0.2rem 0.4rem', minWidth: '30px', textShadow: '0 0 8px rgba(0,255,65,0.4)' }}>{String(v).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.5rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>{l}</div>
                </div>
            ))}
        </div>
    )
}

function EventModal({ event: ev, onClose }) {
    const col = getEventColor(ev.type, ev.tags)
    useEffect(() => { const h = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h) }, [onClose])
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,4,0.9)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                style={{ background: 'rgba(5,18,8,0.98)', border: `1px solid ${col.border}`, borderRadius: '16px', maxWidth: '580px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
                <div style={{ height: '3px', background: `linear-gradient(90deg,${col.primary},${col.primary === '#00ff41' ? '#00d4ff' : '#00ff41'})`, borderRadius: '16px 16px 0 0' }} />
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: col.primary, background: col.secondary, border: `1px solid ${col.border}`, borderRadius: '4px', padding: '0.12rem 0.4rem' }}>{ev.type.toUpperCase()}</span>
                            {ev.ai && <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#00d4ff', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '4px', padding: '0.12rem 0.4rem' }}>★ AI PICK</span>}
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#3a6b45', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.35rem', fontWeight: 800, color: '#e8f5e9', marginBottom: '1rem' }}>{ev.title}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        {[['🏆', 'Prize', ev.prize, '#f59e0b'], ['👥', 'Participants', `${ev.participants}+`, '#00d4ff'], ['⚡', 'Difficulty', ev.difficulty, col.primary]].map(([ic, lb, val, c]) => (
                            <div key={lb} style={{ textAlign: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{ic}</div>
                                <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: c, fontSize: '0.82rem' }}>{val}</div>
                                <div style={{ fontSize: '0.58rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>{lb}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.87rem', color: '#94a3b8', lineHeight: 1.8, marginBottom: '1.25rem' }}>{ev.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#3a6b45', marginBottom: '1.25rem' }}>
                        <Calendar size={13} style={{ color: col.primary }} />
                        {ev.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {ev.status === 'upcoming' && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.62rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>STARTS IN</div>
                            <Countdown d={ev.date} />
                        </div>
                    )}
                    {ev.status === 'upcoming' ? (
                        <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,255,65,0.25),0 0 60px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.97 }}
                            style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.06em' }}>
                            REGISTER NOW
                        </motion.button>
                    ) : (
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#3a6b45', fontFamily: 'JetBrains Mono', padding: '0.75rem', border: '1px solid rgba(100,116,139,0.1)', borderRadius: '8px' }}>Event has ended</div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

function EventCard({ ev, onClick }) {
    const col = getEventColor(ev.type, ev.tags)
    const fill = (ev.participants / ev.max) * 100
    return (
        <motion.div whileHover={{ y: -6, boxShadow: `0 20px 60px ${col.primary}14` }} whileTap={{ scale: 0.985 }} onClick={onClick}
            style={{ background: ev.ai ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: `1px solid ${col.border}`, borderRadius: '12px', padding: '1.4rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${col.primary}55,transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono', color: col.primary, background: col.secondary, border: `1px solid ${col.border}`, borderRadius: '4px', padding: '0.1rem 0.38rem' }}>{ev.type}</span>
                    {ev.ai && <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono', color: '#00d4ff', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', padding: '0.1rem 0.38rem' }}>★ AI</span>}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'Orbitron', fontWeight: 700 }}>{ev.prize}</span>
            </div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.5rem', lineHeight: 1.3 }}>{ev.title}</h3>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {ev.tags.map(t => <span key={t} style={{ fontSize: '0.58rem', color: col.primary, background: col.secondary, border: `1px solid ${col.border}`, borderRadius: '3px', padding: '0.07rem 0.3rem', fontFamily: 'JetBrains Mono' }}>#{t}</span>)}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#3a6b45', lineHeight: 1.6, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.desc}</p>
            <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#3a6b45', marginBottom: '0.2rem', fontFamily: 'JetBrains Mono' }}>
                    <span><Users size={9} style={{ display: 'inline' }} /> {ev.participants}</span>
                    <span>{Math.round(fill)}% filled</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(0,0,0,0.4)', borderRadius: '2px' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(fill, 100)}%` }} transition={{ duration: 1.2 }} style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg,${col.primary},${col.primary === '#00ff41' ? '#00d4ff' : '#00ff41'})` }} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {ev.status === 'upcoming' ? <Countdown d={ev.date} /> : <span style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>Event ended</span>}
                <span style={{ fontSize: '0.68rem', color: col.primary, fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>VIEW <ChevronRight size={10} /></span>
            </div>
        </motion.div>
    )
}

const TABS = [
    { key: 'all', label: 'All' }, { key: 'live', label: '● Live', c: '#00ff41' }, { key: 'upcoming', label: '⚡ Upcoming', c: '#00d4ff' }, { key: 'past', label: 'Past' }
]
const TAGS = ['All', 'AI', 'Cybersecurity', 'CTF', 'Web3', 'ML']

export default function EventsPage() {
    const [tab, setTab] = useState('all')
    const [tag, setTag] = useState('All')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [sort, setSort] = useState('date')

    const filtered = EVENTS.filter(e => {
        if (tab !== 'all' && e.status !== tab) return false
        if (tag !== 'All' && !e.tags.includes(tag)) return false
        if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
    }).sort((a, b) => sort === 'date' ? a.date - b.date : b.participants - a.participants)

    const counts = { all: EVENTS.length, live: EVENTS.filter(e => e.status === 'live').length, upcoming: EVENTS.filter(e => e.status === 'upcoming').length, past: EVENTS.filter(e => e.status === 'past').length }

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5 }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9', marginBottom: '0.3rem' }}>
                        Mission <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Control</span>
                    </h1>
                    <p style={{ color: '#3a6b45', fontSize: '0.88rem' }}>Hackathons, CTFs, workshops. <span style={{ color: '#00ff41' }}>Green</span> = Security · <span style={{ color: '#00d4ff' }}>Blue</span> = AI · ★ = AI Pick</p>
                </motion.div>

                {/* AI Rec Bar */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ marginBottom: '1.5rem', padding: '0.75rem 1.1rem', background: 'rgba(0,10,26,0.85)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Brain size={16} style={{ color: '#00d4ff', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
                        <strong style={{ color: '#e8f5e9' }}>AI Recommendation</strong> — Top events highlighted with ★ based on your skills (Python, Pen Testing)
                    </span>
                </motion.div>

                {/* Tab strip */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {TABS.map(t => {
                        const active = tab === t.key
                        const tc = t.c || '#e8f5e9'
                        return (
                            <motion.button key={t.key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setTab(t.key)}
                                style={{ padding: '0.42rem 0.9rem', borderRadius: '7px', border: active ? `1px solid ${tc}50` : '1px solid rgba(100,116,139,0.1)', background: active ? `${tc}10` : 'rgba(0,0,0,0.25)', color: active ? tc : '#3a6b45', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer', fontWeight: active ? 700 : 400 }}>
                                {t.label} ({counts[t.key]})
                            </motion.button>
                        )
                    })}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#3a6b45' }} />
                        <input className="cyber-input" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {TAGS.map(tg => (
                            <button key={tg} onClick={() => setTag(tg)}
                                style={{ padding: '0.38rem 0.7rem', borderRadius: '6px', border: tag === tg ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(100,116,139,0.1)', background: tag === tg ? 'rgba(0,212,255,0.07)' : 'rgba(0,0,0,0.2)', color: tag === tg ? '#00d4ff' : '#3a6b45', fontSize: '0.73rem', cursor: 'pointer' }}>
                                {tg}
                            </button>
                        ))}
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="cyber-input" style={{ width: 'auto', minWidth: '130px' }}>
                        <option value="date">Sort: Date</option>
                        <option value="participants">Sort: Popular</option>
                    </select>
                </div>

                {/* Grid */}
                {filtered.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                        {filtered.map((ev, i) => (
                            <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                <EventCard ev={ev} onClick={() => setSelected(ev)} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>No events found.</div>
                )}
            </div>
            <AnimatePresence>{selected && <EventModal event={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
        </div>
    )
}
