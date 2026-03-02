import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Edit3, Save, MapPin, Calendar, Star, Activity, TrendingUp, BookOpen, Github, Linkedin, ExternalLink } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { updateUser } from '../store/authSlice'
import { useDispatch } from 'react-redux'

// Contribution heatmap generator
function generateHeatmap() {
    const weeks = 26, days = 7
    return Array.from({ length: weeks }, (_, w) =>
        Array.from({ length: days }, (_, d) => ({
            week: w, day: d,
            count: Math.random() > 0.55 ? Math.floor(Math.random() * 5) : 0,
        }))
    )
}

const HEATMAP_DATA = generateHeatmap()

function ContributionHeatmap() {
    return (
        <div>
            <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {HEATMAP_DATA.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {week.map((day, di) => {
                            const alpha = day.count === 0 ? 0.06 : day.count <= 1 ? 0.25 : day.count <= 2 ? 0.5 : day.count <= 3 ? 0.75 : 1
                            return (
                                <motion.div key={di} whileHover={{ scale: 1.5 }}
                                    title={`${day.count} contributions`}
                                    style={{ width: '11px', height: '11px', borderRadius: '2px', background: day.count === 0 ? 'rgba(255,255,255,0.06)' : `rgba(0,255,65,${alpha})`, cursor: 'default' }}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', color: '#4a7a50' }}>Less</span>
                {[0.06, 0.25, 0.5, 0.75, 1].map(a => (
                    <div key={a} style={{ width: '10px', height: '10px', borderRadius: '2px', background: `rgba(0,255,65,${a})` }} />
                ))}
                <span style={{ fontSize: '0.65rem', color: '#4a7a50' }}>More</span>
            </div>
        </div>
    )
}

const SKILL_CATEGORIES = {
    'AI/ML': ['ML', 'Deep Learning', 'PyTorch', 'NLP', 'Computer Vision'],
    'Security': ['Pen Testing', 'OSINT', 'CTF', 'Web Security', 'OWASP'],
    'Dev': ['Python', 'JavaScript', 'React', 'FastAPI', 'Docker'],
    'Data': ['Statistics', 'Data Science', 'PostgreSQL', 'Redis'],
    'Cloud': ['Cloud Security', 'DevSecOps', 'Kubernetes'],
}

function userSkillRadar(userSkills) {
    return Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => ({
        category: cat,
        level: Math.round((skills.filter(s => userSkills?.includes(s)).length / skills.length) * 100),
    }))
}

const LEARNING_ROADMAPS = {
    'AI / Machine Learning': [
        { step: 1, title: 'Adversarial ML Fundamentals', status: 'complete' },
        { step: 2, title: 'Model Security & Privacy', status: 'active' },
        { step: 3, title: 'Federated Learning', status: 'locked' },
        { step: 4, title: 'LLM Red Teaming', status: 'locked' },
    ],
    'Cybersecurity': [
        { step: 1, title: 'Web Application Security', status: 'complete' },
        { step: 2, title: 'Network Penetration Testing', status: 'active' },
        { step: 3, title: 'Malware Analysis', status: 'locked' },
        { step: 4, title: 'Red Team Operations', status: 'locked' },
    ],
}

const STATUS_STYLE = {
    complete: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: '✓' },
    active: { color: '#00ff41', bg: 'rgba(0,255,65,0.08)', border: 'rgba(0,255,65,0.3)', label: '▶' },
    locked: { color: '#4b5563', bg: 'rgba(75,85,99,0.1)', border: 'rgba(75,85,99,0.25)', label: '🔒' },
}

const MOCK_STATS = { events: 12, posts: 45, upvotes: 230, wins: 3, mentorship: 8, score: 1250 }

export default function ProfilePage() {
    const dispatch = useDispatch()
    const { userId } = useParams()
    const { user } = useSelector(s => s.auth)
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState(user?.name || '')
    const [editDomain, setEditDomain] = useState(user?.domain || '')
    const [editGithub, setEditGithub] = useState(user?.github || '')
    const [editLinkedin, setEditLinkedin] = useState(user?.linkedin || '')
    const [editBio, setEditBio] = useState(user?.bio || '')

    const radarData = userSkillRadar(user?.skills || [])
    const roadmap = LEARNING_ROADMAPS[user?.domain] || LEARNING_ROADMAPS['Cybersecurity']
    const tier = MOCK_STATS.score >= 1000 ? 'Platinum' : MOCK_STATS.score >= 500 ? 'Gold' : MOCK_STATS.score >= 200 ? 'Silver' : 'Bronze'

    const saveProfile = () => {
        dispatch(updateUser({ name: editName, domain: editDomain, github: editGithub, linkedin: editLinkedin, bio: editBio }))
        setEditing(false)
    }

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 3rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />
            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Profile header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', borderColor: 'rgba(0,180,83,0.3)' }}
                >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#00ff41,#00c853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#020d04', border: '3px solid rgba(0,255,65,0.4)' }}>
                            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'OP'}
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: '2px solid #020d04' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        {editing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="cyber-input" placeholder="Full name" style={{ fontSize: '1rem', fontWeight: 700 }} />
                                <input value={editDomain} onChange={e => setEditDomain(e.target.value)} className="cyber-input" placeholder="Domain (e.g. Cybersecurity)" />
                                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="cyber-input" placeholder="Bio — tell the community about yourself" style={{ resize: 'vertical', minHeight: '60px', fontSize: '0.85rem' }} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Github size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4a7a50' }} />
                                        <input value={editGithub} onChange={e => setEditGithub(e.target.value)} className="cyber-input" placeholder="github.com/username" style={{ paddingLeft: '2.2rem' }} />
                                    </div>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Linkedin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4a7a50' }} />
                                        <input value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)} className="cyber-input" placeholder="linkedin.com/in/username" style={{ paddingLeft: '2.2rem' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={saveProfile} style={{ padding: '0.4rem 1rem', background: 'linear-gradient(135deg,#00ff41,#00c853)', border: 'none', borderRadius: '6px', color: '#020d04', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                        <Save size={13} /> Save
                                    </button>
                                    <button onClick={() => setEditing(false)} style={{ padding: '0.4rem 1rem', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.25)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0' }}>{user?.name || 'Operator'}</h1>
                                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.7rem', borderRadius: '12px', background: tier === 'Platinum' ? 'rgba(0,255,65,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${tier === 'Platinum' ? 'rgba(0,255,65,0.3)' : 'rgba(245,158,11,0.3)'}`, color: tier === 'Platinum' ? '#00ff41' : '#f59e0b' }}>💎 {tier}</span>
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(0,180,83,0.1)', border: '1px solid rgba(0,180,83,0.25)', borderRadius: '8px', padding: '0.15rem 0.5rem', color: '#a7f3c3' }}>{user?.role || 'Member'}</span>
                                </div>
                                {user?.bio && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.6 }}>{user.bio}</p>}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#4a7a50' }}>
                                    <span>🌐 {user?.domain || 'AI × Security'}</span>
                                    <span>🎯 {user?.experience || 'Intermediate'}</span>
                                    <span>📦 {user?.skills?.length || 0} skills</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                                    {(user?.github || editGithub) && (
                                        <a href={`https://${(user?.github || editGithub).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'none', padding: '0.3rem 0.7rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: '6px' }}
                                        ><Github size={13} /> GitHub <ExternalLink size={10} /></a>
                                    )}
                                    {(user?.linkedin || editLinkedin) && (
                                        <a href={`https://${(user?.linkedin || editLinkedin).replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'none', padding: '0.3rem 0.7rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: '6px' }}
                                        ><Linkedin size={13} /> LinkedIn <ExternalLink size={10} /></a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {!editing && (
                        <button onClick={() => setEditing(true)} style={{ background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '7px', padding: '0.5rem 0.8rem', color: '#00ff41', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                            <Edit3 size={13} /> Edit
                        </button>
                    )}
                </motion.div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Score', value: MOCK_STATS.score.toLocaleString(), color: '#00ff41', icon: '⚡' },
                        { label: 'Events', value: MOCK_STATS.events, color: '#00c853', icon: '🎯' },
                        { label: 'Posts', value: MOCK_STATS.posts, color: '#10b981', icon: '📝' },
                        { label: 'Upvotes', value: MOCK_STATS.upvotes, color: '#f59e0b', icon: '👍' },
                        { label: 'Wins', value: MOCK_STATS.wins, color: '#ef4444', icon: '🏆' },
                        { label: 'Mentorship', value: MOCK_STATS.mentorship, color: '#ec4899', icon: '🎓' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="glass-card"
                            style={{ padding: '1rem', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                            <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#4a7a50', marginTop: '0.2rem' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Skill Radar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card" style={{ padding: '1.75rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <Activity size={18} style={{ color: '#00ff41' }} />
                            <h2 style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Skill Radar</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(0,255,65,0.12)" />
                                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name="Skills" dataKey="level" stroke="#00c853" fill="rgba(0,180,83,0.2)" strokeWidth={2} dot={{ fill: '#00c853', r: 3 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                        {/* Skill tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                            {(user?.skills || ['Python', 'ML', 'Web Security']).map(s => (
                                <span key={s} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(0,180,83,0.1)', border: '1px solid rgba(0,180,83,0.25)', borderRadius: '4px', color: '#a7f3c3' }}>{s}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right column: heatmap + roadmap */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Contribution heatmap */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                            className="glass-card" style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                <TrendingUp size={16} style={{ color: '#10b981' }} />
                                <h2 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Contributions</h2>
                            </div>
                            <ContributionHeatmap />
                        </motion.div>

                        {/* Learning Roadmap */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
                            className="glass-card" style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                <BookOpen size={16} style={{ color: '#f59e0b' }} />
                                <h2 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>AI Learning Path</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {roadmap.map((item, i) => {
                                    const s = STATUS_STYLE[item.status]
                                    return (
                                        <motion.div key={item.step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', borderRadius: '8px', background: s.bg, border: `1px solid ${s.border}` }}
                                        >
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: s.color, flexShrink: 0 }}>
                                                {s.label}
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: item.status === 'locked' ? '#4b5563' : '#e2e8f0' }}>{item.title}</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
