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

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((s) => s.auth)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
                    {isAuthenticated ? (
                        <>
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.45rem 0.9rem',
                                            borderRadius: '6px',
                                            // Active: blue (AI/community destination). Inactive: muted.
                                            color: location.pathname === path ? '#00d4ff' : '#94a3b8',
                                            background: location.pathname === path ? 'rgba(0,212,255,0.07)' : 'transparent',
                                            border: location.pathname === path ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <Icon size={15} />
                                        {label}
                                    </motion.div>
                                </Link>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                {/* Notification Bell */}
                                <NotificationBell />
                                {/* Admin link — only for admins */}
                                {user?.role === 'admin' && (
                                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ scale: 1.06 }}
                                            style={{ padding: '0.38rem 0.6rem', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                            <Settings size={14} />
                                        </motion.div>
                                    </Link>
                                )}
                                <Link to="/profile" style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            background: 'rgba(0,212,255,0.07)',
                                            border: '1px solid rgba(0,212,255,0.2)',
                                        }}
                                    >
                                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={13} style={{ color: '#020d04' }} />
                                        </div>
                                        <span style={{ fontSize: '0.82rem', color: '#00d4ff', fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'Agent'}</span>
                                    </motion.div>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                        color: '#f87171', padding: '0.45rem 0.7rem', borderRadius: '6px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem',
                                    }}
                                >
                                    <LogOut size={14} />
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link to="/login">
                                <motion.button whileHover={{ y: -2 }} className="btn-cyber" style={{ fontSize: '0.8rem' }}>Login</motion.button>
                            </Link>
                            <Link to="/signup">
                                <motion.button whileHover={{ y: -2 }} className="btn-cyber btn-primary" style={{ fontSize: '0.8rem' }}>Join HQ</motion.button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer', display: 'flex' }}
                    className="md:hidden"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'rgba(2,13,4,0.98)',
                            borderTop: '1px solid rgba(0,255,65,0.1)',
                            padding: '1rem 1.5rem',
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        }}
                    >
                        {isAuthenticated ? (
                            <>
                                {navLinks.map(({ path, label, icon: Icon }) => (
                                    <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', color: '#e2e8f0', borderRadius: '8px', background: 'rgba(0,255,65,0.05)' }}>
                                            <Icon size={16} style={{ color: '#00ff41' }} />
                                            {label}
                                        </div>
                                    </Link>
                                ))}
                                <button onClick={handleLogout} style={{ textAlign: 'left', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.7rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileOpen(false)}>
                                    <button style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
                                </Link>
                                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                                    <button style={{ width: '100%', padding: '0.7rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', color: '#020d04', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Join HQ</button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
