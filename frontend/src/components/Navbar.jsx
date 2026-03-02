import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '../store/authSlice'
import { Shield, Zap, Users, Trophy, MessageSquare, User, LogOut, Menu, X, BookOpen, PenTool, Hash, Settings } from 'lucide-react'
import NotificationBell from './NotificationBell'

const navLinks = [
    { path: '/events', label: 'Events', icon: Zap },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/feed', label: 'Feed', icon: MessageSquare },
    { path: '/forum', label: 'Forum', icon: Hash },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/blog', label: 'Blog', icon: PenTool },
    { path: '/threat-analyzer', label: 'Threat Scan', icon: Shield },
]

const BREAKPOINT = 900 // px — switch to desktop layout above this

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((s) => s.auth)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= BREAKPOINT)

    // Close menu on route change
    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    // Scroll listener for glass effect
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    // Responsive breakpoint listener
    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= BREAKPOINT)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = (!isDesktop && mobileOpen) ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen, isDesktop])

    const handleLogout = () => {
        dispatch(logout())
        setMobileOpen(false)
        navigate('/')
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                    background: scrolled ? 'rgba(2,13,4,0.97)' : 'rgba(2,13,4,0.75)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,255,65,0.1)',
                    transition: 'background 0.3s ease',
                }}
            >
                {/* ── Bar ─────────────────────────────────────────────────── */}
                <div style={{
                    maxWidth: '1280px', margin: '0 auto',
                    padding: '0 1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: '62px',
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0 }}>
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                            <Shield size={26} style={{ color: '#00ff41' }} />
                        </motion.div>
                        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                            <span style={{ color: '#00ff41' }}>Digital</span>
                            <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HQ</span>
                        </span>
                    </Link>

                    {/* Desktop nav — only rendered when wide enough */}
                    {isDesktop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                            {isAuthenticated ? (
                                <>
                                    {navLinks.map(({ path, label, icon: Icon }) => (
                                        <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                                            <motion.div
                                                whileHover={{ y: -2 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                    padding: '0.4rem 0.75rem',
                                                    borderRadius: '6px',
                                                    color: location.pathname === path ? '#00d4ff' : '#94a3b8',
                                                    background: location.pathname === path ? 'rgba(0,212,255,0.07)' : 'transparent',
                                                    border: location.pathname === path ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Icon size={13} />
                                                {label}
                                            </motion.div>
                                        </Link>
                                    ))}
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to="/login" style={{ textDecoration: 'none' }}>
                                        <motion.button whileHover={{ y: -2 }} className="btn-cyber" style={{ fontSize: '0.78rem' }}>Login</motion.button>
                                    </Link>
                                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                                        <motion.button whileHover={{ y: -2 }} className="btn-cyber btn-primary" style={{ fontSize: '0.78rem' }}>Join HQ</motion.button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Desktop right actions */}
                    {isDesktop && isAuthenticated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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
                                <motion.div whileHover={{ scale: 1.05 }} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                                    padding: '0.38rem 0.75rem', borderRadius: '20px',
                                    background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                                }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={12} style={{ color: '#020d04' }} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'Agent'}</span>
                                </motion.div>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#f87171', padding: '0.42rem 0.65rem', borderRadius: '6px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem',
                                }}
                            >
                                <LogOut size={13} />
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile hamburger — only when narrow */}
                    {!isDesktop && (
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            style={{
                                background: 'none', border: 'none', color: '#00ff41',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', padding: '0.4rem', borderRadius: '6px',
                                flexShrink: 0,
                            }}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    )}
                </div>
            </motion.nav>

            {/* ── Mobile overlay ───────────────────────────────────────────── */}
            <AnimatePresence>
                {!isDesktop && mobileOpen && (
                    <>
                        {/* Dim backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 998,
                                background: 'rgba(0,0,0,0.55)',
                                backdropFilter: 'blur(2px)',
                            }}
                        />

                        {/* Slide-down panel */}
                        <motion.div
                            key="mobile-menu"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{
                                position: 'fixed', top: '62px', left: 0, right: 0, zIndex: 999,
                                background: 'rgba(2,13,4,0.99)',
                                borderBottom: '1px solid rgba(0,255,65,0.15)',
                                maxHeight: 'calc(100dvh - 62px)',
                                overflowY: 'auto',
                                padding: '1rem 1.25rem 1.5rem',
                                display: 'flex', flexDirection: 'column', gap: '0.45rem',
                            }}
                        >
                            {isAuthenticated ? (
                                <>
                                    {/* User pill */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                                        padding: '0.75rem 1rem', marginBottom: '0.35rem',
                                        background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)',
                                        borderRadius: '10px',
                                    }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <User size={15} style={{ color: '#020d04' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{user?.name || 'Agent'}</div>
                                            <div style={{ fontSize: '0.68rem', color: '#3a6b45', fontFamily: 'JetBrains Mono' }}>{user?.email || ''}</div>
                                        </div>
                                        <NotificationBell style={{ marginLeft: 'auto' }} />
                                    </div>

                                    {/* Nav links */}
                                    {navLinks.map(({ path, label, icon: Icon }) => (
                                        <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.7rem',
                                                padding: '0.75rem 1rem', borderRadius: '8px',
                                                background: location.pathname === path ? 'rgba(0,212,255,0.08)' : 'rgba(0,255,65,0.03)',
                                                border: location.pathname === path ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(0,255,65,0.07)',
                                                color: location.pathname === path ? '#00d4ff' : '#cbd5e1',
                                                fontSize: '0.88rem', fontWeight: 500,
                                                transition: 'all 0.15s ease',
                                            }}>
                                                <Icon size={16} style={{ color: location.pathname === path ? '#00d4ff' : '#00ff41', flexShrink: 0 }} />
                                                {label}
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Divider */}
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.25rem 0' }} />

                                    {/* Profile & Admin */}
                                    <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.07)', color: '#cbd5e1', fontSize: '0.88rem' }}>
                                            <User size={16} style={{ color: '#00ff41', flexShrink: 0 }} /> My Profile
                                        </div>
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.88rem' }}>
                                                <Settings size={16} style={{ flexShrink: 0 }} /> Admin Panel
                                            </div>
                                        </Link>
                                    )}

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                                            padding: '0.75rem 1rem', borderRadius: '8px',
                                            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                                            color: '#f87171', fontSize: '0.88rem', cursor: 'pointer', width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <LogOut size={16} style={{ flexShrink: 0 }} /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <button style={{
                                            width: '100%', padding: '0.8rem',
                                            background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.3)',
                                            color: '#00ff41', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '0.9rem', fontWeight: 600,
                                        }}>Login</button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <button style={{
                                            width: '100%', padding: '0.8rem',
                                            background: 'linear-gradient(135deg,#00ff41,#00d4ff)',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            color: '#020d04', fontWeight: 700, fontSize: '0.9rem',
                                        }}>Join HQ</button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
