import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, UserPlus, AlertCircle, Check } from 'lucide-react'
import { setCredentials } from '../store/authSlice'
import { authAPI } from '../api/axios'

const SKILLS_LIST = ['Python', 'JavaScript', 'Go', 'Rust', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch', 'TensorFlow', 'Pen Testing', 'OSINT', 'Malware Analysis', 'Reverse Engineering', 'CTF', 'Network Security', 'Web Security', 'OWASP', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'React', 'FastAPI', 'Web3', 'Smart Contracts', 'Data Science', 'Statistics', 'Cloud Security', 'DevSecOps']
const DOMAINS = ['AI / Machine Learning', 'Cybersecurity', 'Full Stack Development', 'Data Science', 'Web3 / Blockchain', 'Cloud & DevSecOps']
const EXPERIENCE = ['Beginner (0-1 yr)', 'Intermediate (1-3 yrs)', 'Advanced (3-5 yrs)', 'Expert (5+ yrs)']

const STEPS = ['Identity', 'Skills', 'Experience']

export default function SignupPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [showPwd, setShowPwd] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        skills: [], domain: '', experience: '',
    })

    const toggleSkill = (skill) => {
        setForm(f => ({
            ...f,
            skills: f.skills.includes(skill)
                ? f.skills.filter(s => s !== skill)
                : [...f.skills, skill],
        }))
    }

    const nextStep = () => {
        if (step === 0) {
            if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return }
            if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
        }
        if (step === 1 && form.skills.length === 0) { setError('Select at least one skill.'); return }
        setError('')
        setStep(s => s + 1)
    }

    const handleSubmit = async () => {
        if (!form.domain || !form.experience) { setError('Please complete all fields.'); return }
        setLoading(true)
        try {
            const res = await authAPI.register(form)
            dispatch(setCredentials({ token: res.data.access_token, user: res.data.user }))
            navigate('/events')
        } catch {
            // Demo fallback
            const user = { id: Date.now(), name: form.name, email: form.email, role: 'Member', domain: form.domain, skills: form.skills, experience: form.experience }
            dispatch(setCredentials({ token: 'demo_signup_token_' + user.id, user }))
            navigate('/events')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingTop: '85px', background: 'radial-gradient(ellipse at 50% 40%, rgba(0,255,65,0.05) 0%, rgba(2,13,4,1) 70%)' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={36} style={{ color: '#00ff41', marginBottom: '0.75rem' }} />
                    <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.3rem' }}>ENLIST OPERATOR</h1>
                    <p style={{ fontSize: '0.82rem', color: '#4a7a50' }}>Join the AI × Cybersecurity Command Center</p>
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1 }}>
                            <div style={{ height: '3px', borderRadius: '2px', background: i <= step ? 'linear-gradient(90deg,#00ff41,#00c853)' : 'rgba(100,116,139,0.3)', transition: 'background 0.4s ease' }} />
                            <div style={{ fontSize: '0.68rem', color: i <= step ? '#00ff41' : '#4a7a50', textAlign: 'center', marginTop: '0.3rem', fontFamily: 'JetBrains Mono' }}>{s}</div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 0: Identity */}
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>DISPLAY NAME</label>
                                <input className="cyber-input" placeholder="e.g. Arya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>EMAIL</label>
                                <input type="email" className="cyber-input" placeholder="operator@hq.dev" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>PASSPHRASE (min 8 chars)</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPwd ? 'text' : 'password'} className="cyber-input" placeholder="•••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: '3rem' }} />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a7a50', cursor: 'pointer' }}>
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Skills */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <p style={{ fontSize: '0.82rem', color: '#4a7a50', marginBottom: '1rem' }}>Select your skill arsenal ({form.skills.length} selected)</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto', padding: '0.5rem 0' }}>
                                {SKILLS_LIST.map(skill => (
                                    <motion.button key={skill} whileTap={{ scale: 0.93 }} onClick={() => toggleSkill(skill)}
                                        style={{
                                            padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', cursor: 'pointer',
                                            background: form.skills.includes(skill) ? 'rgba(0,255,65,0.15)' : 'rgba(10,26,13,0.9)',
                                            border: form.skills.includes(skill) ? '1px solid rgba(0,255,65,0.5)' : '1px solid rgba(100,116,139,0.3)',
                                            color: form.skills.includes(skill) ? '#00ff41' : '#94a3b8',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                        }}
                                    >
                                        {form.skills.includes(skill) && <Check size={11} />}
                                        {skill}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Experience */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.6rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>PRIMARY DOMAIN</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {DOMAINS.map(d => (
                                        <button key={d} onClick={() => setForm({ ...form, domain: d })}
                                            style={{ padding: '0.65rem 1rem', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', background: form.domain === d ? 'rgba(0,255,65,0.1)' : 'rgba(10,26,13,0.9)', border: form.domain === d ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(100,116,139,0.2)', color: form.domain === d ? '#00ff41' : '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            {form.domain === d && <Check size={14} style={{ color: '#00ff41' }} />}
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.6rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>EXPERIENCE LEVEL</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {EXPERIENCE.map(exp => (
                                        <button key={exp} onClick={() => setForm({ ...form, experience: exp })}
                                            style={{ padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', background: form.experience === exp ? 'rgba(0,180,83,0.15)' : 'rgba(10,26,13,0.9)', border: form.experience === exp ? '1px solid rgba(0,180,83,0.4)' : '1px solid rgba(100,116,139,0.2)', color: form.experience === exp ? '#a7f3c3' : '#94a3b8', fontSize: '0.78rem', textAlign: 'center' }}
                                        >
                                            {exp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', marginTop: '1rem', background: 'rgba(239,68,68,0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                        <AlertCircle size={14} /> {error}
                    </motion.div>
                )}

                {/* Nav buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                    {step > 0 && (
                        <button onClick={() => setStep(s => s - 1)}
                            style={{ flex: 1, padding: '0.8rem', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer' }}
                        >← Back</button>
                    )}
                    {step < 2 ? (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep}
                            style={{ flex: 2, padding: '0.8rem', background: 'linear-gradient(135deg, #00ff41, #00c853)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.06em' }}
                        >NEXT →</motion.button>
                    ) : (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
                            style={{ flex: 2, padding: '0.8rem', background: 'linear-gradient(135deg, #00ff41, #00c853)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {loading ? '⟳ ENLISTING…' : <><UserPlus size={16} /> LAUNCH PROFILE</>}
                        </motion.button>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#4a7a50' }}>
                    Already enlisted?{' '}
                    <Link to="/login" style={{ color: '#00ff41', textDecoration: 'none', fontWeight: 600 }}>Access Portal →</Link>
                </p>
            </motion.div>
        </div>
    )
}
