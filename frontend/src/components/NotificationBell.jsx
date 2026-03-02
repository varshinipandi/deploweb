import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'

const INIT_NOTIFS = [
    { id: 1, type: 'upvote', msg: 'Ravi Nair upvoted your post on JWT vulnerabilities', time: '2m ago', read: false, icon: '👍', color: '#00ff41' },
    { id: 2, type: 'comment', msg: 'Priya Mehta commented on your CTF writeup', time: '15m ago', read: false, icon: '💬', color: '#00d4ff' },
    { id: 3, type: 'badge', msg: '🏅 New badge unlocked: Cyber Defender', time: '1h ago', read: false, icon: '🏅', color: '#f59e0b' },
    { id: 4, type: 'event', msg: '⏰ HackAI 2026 starts in 24 hours — you\'re registered!', time: '3h ago', read: false, icon: '📅', color: '#00d4ff' },
    { id: 5, type: 'join', msg: 'Your join request for Zero Day Crafters was approved', time: '5h ago', read: true, icon: '✅', color: '#00ff41' },
    { id: 6, type: 'upvote', msg: 'Kiran Das upvoted your resource submission', time: '1d ago', read: true, icon: '👍', color: '#00ff41' },
]

export default function NotificationBell() {
    const [notifs, setNotifs] = useState(INIT_NOTIFS)
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const unread = notifs.filter(n => !n.read).length

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const markAll = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))
    const dismiss = (id) => setNotifs(ns => ns.filter(n => n.id !== id))

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}>
                <Bell size={18} style={{ color: unread > 0 ? '#00ff41' : '#64748b', filter: unread > 0 ? 'drop-shadow(0 0 6px rgba(0,255,65,0.6))' : 'none' }} />
                {unread > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', fontWeight: 700, border: '2px solid #020d04' }}>
                        {unread}
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '340px', background: 'rgba(5,18,8,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,65,0.08)', zIndex: 1000 }}>
                        {/* Header */}
                        <div style={{ height: '2px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem 0.6rem' }}>
                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color: '#e8f5e9' }}>Notifications {unread > 0 && <span style={{ fontSize: '0.65rem', color: '#00ff41' }}>({unread} new)</span>}</span>
                            {unread > 0 && (
                                <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>
                                    <Check size={10} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                            {notifs.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>All caught up ✓</div>
                            )}
                            {notifs.map((n, i) => (
                                <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                    style={{ padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(0,255,65,0.025)', position: 'relative', transition: 'background 0.2s' }}>
                                    {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: n.color, borderRadius: '0 2px 2px 0' }} />}
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${n.color}15`, border: `1px solid ${n.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>{n.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.76rem', color: n.read ? '#64748b' : '#94a3b8', lineHeight: 1.5, marginBottom: '0.12rem' }}>{n.msg}</p>
                                        <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{n.time}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); dismiss(n.id) }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', flexShrink: 0, padding: '0.1rem' }}><X size={11} /></button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                            <button onClick={() => setNotifs([])} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>Clear all notifications</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
