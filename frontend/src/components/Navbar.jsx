import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '../store/authSlice'
import { Shield, Zap, Users, Trophy, MessageSquare, User, LogOut, Menu, X, BookOpen, PenTool, Hash, Settings } from 'lucide-react'
import NotificationBell from './NotificationBell'

// Each nav link gets its own color identity
const navLinks = [
    { path: '/events', label: 'Events', icon: Zap, color: '#00ff41', bg: 'rgba(0,255,65,0.09)', border: 'rgba(0,255,65,0.22)' },
    { path: '/teams', label: 'Teams', icon: Users, color: '#00d4ff', bg: 'rgba(0,212,255,0.09)', border: 'rgba(0,212,255,0.22)' },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.22)' },
    { path: '/feed', label: 'Feed', icon: MessageSquare, color: '#a78bfa', bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.22)' },
    { path: '/forum', label: 'Forum', icon: Hash, color: '#34d399', bg: 'rgba(52,211,153,0.09)', border: 'rgba(52,211,153,0.22)' },
    { path: '/resources', label: 'Resources', icon: BookOpen, color: '#60a5fa', bg: 'rgba(96,165,250,0.09)', border: 'rgba(96,165,250,0.22)' },
    { path: '/blog', label: 'Blog', icon: PenTool, color: '#f472b6', bg: 'rgba(244,114,182,0.09)', border: 'rgba(244,114,182,0.22)' },
    { path: '/threat-analyzer', label: 'Threat Scan', icon: Shield, color: '#ff6b6b', bg: 'rgba(255,107,107,0.09)', border: 'rgba(255,107,107,0.22)' },
]

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((s) => s.auth)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    useEffect(() => {
        document.body.style.overflow = (!isDesktop && mobileOpen) ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen, isDesktop])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: scrolled ? 'rgba(2,13,4,0.95)' : 'rgba(2,13,4,0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,255,65,0.1)',
                transition: 'all 0.3s ease',
            }}
        >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '65px' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                        <Shield size={28} style={{ color: '#00ff41' }} />
                    </motion.div>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <span style={{ color: '#00ff41' }}>Digital</span><span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HQ</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#2d5a35', fontFamily: 'JetBrains Mono, monospace', marginLeft: '-0.2rem' }}>×</span>
                </Link>

                {/* Desktop nav */}
                {isDesktop && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isAuthenticated ? (
                            <>
                                {navLinks.map(({ path, label, icon: Icon }) => (
                                    <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                padding: '0.45rem 0.9rem', borderRadius: '6px',
                                                color: location.pathname === path ? '#00d4ff' : '#94a3b8',
                                                background: location.pathname === path ? 'rgba(0,212,255,0.07)' : 'transparent',
                                                border: location.pathname === path ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                                                fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <Icon size={15} />{label}
                                        </motion.div>
                                    </Link>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <NotificationBell />
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" style={{ textDecoration: 'none' }}>
                                            <motion.div whileHover={{ scale: 1.06 }}
                                                style={{ padding: '0.38rem 0.6rem', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                                <Settings size={14} />
                                            </motion.div>
                                        </Link>
                                    )}
                                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={13} style={{ color: '#020d04' }} />
                                            </div>
                                            <span style={{ fontSize: '0.82rem', color: '#00d4ff', fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'Agent'}</span>
                                        </motion.div>
                                    </Link>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.45rem 0.7rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                                        <LogOut size={14} />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Link to="/login"><motion.button whileHover={{ y: -2 }} className="btn-cyber" style={{ fontSize: '0.8rem' }}>Login</motion.button></Link>
                                <Link to="/signup"><motion.button whileHover={{ y: -2 }} className="btn-cyber btn-primary" style={{ fontSize: '0.8rem' }}>Join HQ</motion.button></Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile toggle */}
                {!isDesktop && (
                    <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
                        style={{ background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer', display: 'flex' }}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}
            </div>

            {/* ── Mobile Menu ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {!isDesktop && mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'rgba(4,10,18,0.99)',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            maxHeight: 'calc(100dvh - 65px)',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Rainbow gradient bar */}
                        <div style={{ height: '2px', background: 'linear-gradient(90deg, #00ff41, #00d4ff, #a78bfa, #f472b6, #f59e0b, #00ff41)', flexShrink: 0 }} />

                        <div style={{ padding: '0.9rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {isAuthenticated ? (
                                <>
                                    {/* User pill */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.7rem 1rem', marginBottom: '0.4rem',
                                        background: 'linear-gradient(135deg, rgba(0,255,65,0.06), rgba(0,212,255,0.06))',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px',
                                    }}>
                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <User size={16} style={{ color: '#020d04' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Agent'}</div>
                                            <div style={{ fontSize: '0.66rem', color: '#64748b', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'digitalhq.member'}</div>
                                        </div>
                                        <NotificationBell />
                                    </div>

                                    {/* Colored nav links — 2 columns grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                        {navLinks.map(({ path, label, icon: Icon, color, bg, border }) => {
                                            const isActive = location.pathname === path
                                            return (
                                                <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.55rem',
                                                        padding: '0.65rem 0.85rem', borderRadius: '9px',
                                                        background: isActive ? bg : 'rgba(255,255,255,0.03)',
                                                        border: isActive ? `1px solid ${border}` : '1px solid rgba(255,255,255,0.05)',
                                                        transition: 'all 0.15s ease',
                                                    }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <Icon size={14} style={{ color }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? color : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.1rem 0' }} />

                                    {/* Profile + Admin row */}
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '9px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#00d4ff', fontSize: '0.82rem' }}>
                                                <User size={14} /> Profile
                                            </div>
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '9px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.82rem' }}>
                                                    <Settings size={14} /> Admin
                                                </div>
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '9px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer' }}>
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <button style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', borderRadius: '9px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 600 }}>Login</button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <button style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', color: '#020d04', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}>Join HQ — Free</button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
