import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { setCredentials, setLoading } from '../store/authSlice'
import { authAPI } from '../api/axios'

// Mock login for demo (when backend unavailable)
const MOCK_USERS = [
    { id: 1, name: 'Arya Sharma', email: 'arya@hq.dev', password: 'hq123456', role: 'Admin', domain: 'Cybersecurity', skills: ['Python', 'Pen Testing', 'OSINT'] },
    { id: 2, name: 'Ravi Nair', email: 'ravi@hq.dev', password: 'hq123456', role: 'Member', domain: 'AI', skills: ['ML', 'PyTorch', 'NLP'] },
]

export default function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoadingLocal] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return }

        setLoadingLocal(true)
        try {
            const res = await authAPI.login(form)
            dispatch(setCredentials({ token: res.data.access_token, user: res.data.user }))
            navigate('/events')
        } catch {
            // Demo fallback
            const mockUser = MOCK_USERS.find(u => u.email === form.email && u.password === form.password)
            if (mockUser) {
                const { password, ...user } = mockUser
                dispatch(setCredentials({ token: 'demo_jwt_token_' + user.id, user }))
                navigate('/events')
            } else {
                setError('Invalid credentials. Try arya@hq.dev / hq123456')
            }
        } finally {
            setLoadingLocal(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingTop: '85px', background: 'radial-gradient(ellipse at 50% 60%, rgba(0,180,83,0.08) 0%, rgba(2,13,4,1) 70%)' }}>
            {/* Background grid */}
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block', marginBottom: '1rem' }}
                    >
                        <Shield size={40} style={{ color: '#00ff41' }} />
                    </motion.div>
                    <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>ACCESS PORTAL</h1>
                    <p style={{ fontSize: '0.83rem', color: '#4a7a50' }}>Authenticate to enter the Digital HQ</p>
                </div>

                {/* Demo hint */}
                <div style={{ background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#4a7a50', fontFamily: 'JetBrains Mono' }}>
                    Demo: arya@hq.dev / hq123456
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', display: 'block', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                        <input
                            type="email" autoComplete="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="cyber-input"
                            placeholder="operator@hq.dev"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', display: 'block', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>PASSPHRASE</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPwd ? 'text' : 'password'} autoComplete="current-password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="cyber-input"
                                placeholder="••••••••"
                                style={{ paddingRight: '3rem' }}
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a7a50', cursor: 'pointer' }}
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.82rem', background: 'rgba(239,68,68,0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            <AlertCircle size={14} /> {error}
                        </motion.div>
                    )}

                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '0.85rem', background: 'linear-gradient(135deg, #00ff41, #00c853)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.08em' }}
                    >
                        {loading ? '⟳ AUTHENTICATING…' : <><LogIn size={16} /> AUTHENTICATE</>}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#4a7a50' }}>
                    New operator?{' '}
                    <Link to="/signup" style={{ color: '#00ff41', textDecoration: 'none', fontWeight: 600 }}>Create account →</Link>
                </p>
            </motion.div>
        </div>
    )
}
