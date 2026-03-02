import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, AlertTriangle, BarChart2, Megaphone, X, CheckCircle, XCircle, Ban, Crown, TrendingUp, Activity } from 'lucide-react'
import { useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

// Green = security/system metrics | Blue = community/AI metrics
const ENGAGEMENT_DATA = [
    { day: 'Mon', posts: 12, logins: 45, events: 2 },
    { day: 'Tue', posts: 18, logins: 62, events: 1 },
    { day: 'Wed', posts: 9, logins: 38, events: 3 },
    { day: 'Thu', posts: 24, logins: 81, events: 0 },
    { day: 'Fri', posts: 31, logins: 97, events: 2 },
    { day: 'Sat', posts: 16, logins: 54, events: 4 },
    { day: 'Sun', posts: 8, logins: 29, events: 1 },
]
const DOMAIN_DATA = [
    { name: 'Cybersecurity', value: 38, color: '#00ff41' },
    { name: 'AI/ML', value: 29, color: '#00d4ff' },
    { name: 'Web Dev', value: 18, color: '#f59e0b' },
    { name: 'Other', value: 15, color: '#94a3b8' },
]
const MOCK_USERS = [
    { id: 1, name: 'Arya Sharma', email: 'arya@hq.com', role: 'admin', status: 'active', domain: 'Cybersecurity', joined: 'Jan 2026', posts: 45, score: 1346 },
    { id: 2, name: 'Ravi Nair', email: 'ravi@hq.com', role: 'member', status: 'active', domain: 'AI', joined: 'Jan 2026', posts: 67, score: 1194 },
    { id: 3, name: 'Priya Mehta', email: 'priya@hq.com', role: 'member', status: 'active', domain: 'Full Stack', joined: 'Feb 2026', posts: 32, score: 1029 },
    { id: 4, name: 'Kiran Das', email: 'kiran@hq.com', role: 'member', status: 'muted', domain: 'Data Science', joined: 'Feb 2026', posts: 28, score: 615 },
    { id: 5, name: 'Sana Qureshi', email: 'sana@hq.com', role: 'member', status: 'active', domain: 'Cybersecurity', joined: 'Feb 2026', posts: 21, score: 549 },
    { id: 6, name: 'Suspicious User', email: 'spam@suspicious.ru', role: 'member', status: 'active', domain: 'General', joined: 'Mar 2026', posts: 0, score: 0 },
]
const MOCK_REPORTS = [
    { id: 1, type: 'post', content: 'Spam promotional content with phishing link', reporter: 'Arya Sharma', reported: 'Suspicious User', time: '30m ago', status: 'pending', severity: 'High' },
    { id: 2, type: 'post', content: 'Misinformation about CVE-2025-1234 severity', reporter: 'Ravi Nair', reported: 'Kiran Das', time: '2h ago', status: 'pending', severity: 'Medium' },
    { id: 3, type: 'comment', content: 'Harassing comment in the internship thread', reporter: 'Priya Mehta', reported: 'Unknown', time: '5h ago', status: 'resolved', severity: 'High' },
]
const MOCK_RESOURCES = [{ id: 10, title: 'Adversarial ML Cheatsheet', type: 'PDF', submittedBy: 'Yash Trivedi', status: 'pending' }, { id: 11, title: 'CTF 2025 Writeup', type: 'CTF Writeup', submittedBy: 'Deepak Rao', status: 'pending' }]

const STAT_CARDS = [
    { label: 'Total Members', value: '247', icon: Users, color: '#00d4ff', sub: '+12 this week', trend: 'up' },
    { label: 'Active Today', value: '89', icon: Activity, color: '#00ff41', sub: '36% of members', trend: 'up' },
    { label: 'Posts (7d)', value: '118', icon: TrendingUp, color: '#00d4ff', sub: '+24% vs last week', trend: 'up' },
    { label: 'Pending Reports', value: '2', icon: AlertTriangle, color: '#f59e0b', sub: '1 High severity', trend: 'neutral' },
]

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) return (
        <div style={{ background: 'rgba(5,18,8,0.95)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '6px', padding: '0.5rem 0.85rem', fontSize: '0.75rem', color: '#e8f5e9', fontFamily: 'JetBrains Mono' }}>
            {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
        </div>
    ); return null
}

const TABS = ['Analytics', 'Users', 'Reports', 'Resources', 'Announcements']

export default function AdminPage() {
    const { user } = useSelector(s => s.auth)
    const [tab, setTab] = useState('Analytics')
    const [users, setUsers] = useState(MOCK_USERS)
    const [reports, setReports] = useState(MOCK_REPORTS)
    const [resources, setResources] = useState(MOCK_RESOURCES)
    const [announcement, setAnnouncement] = useState('')
    const [activeAnn, setActiveAnn] = useState(null)

    const banUser = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u))
    const muteUser = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'muted' ? 'active' : 'muted' } : u))
    const promoteUser = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, role: u.role === 'admin' ? 'member' : 'admin' } : u))
    const resolveReport = (id) => setReports(rs => rs.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
    const approveResource = (id, approved) => setResources(rs => rs.filter(r => r.id !== id))

    if (user?.role !== 'admin') return (
        <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh' }}>
            <Shield size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'Orbitron', color: '#ef4444' }}>Access Denied</h2>
            <p style={{ color: '#64748b' }}>Admin credentials required.</p>
        </div>
    )

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35 }} />
            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Active announcement banner */}
                <AnimatePresence>
                    {activeAnn && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Megaphone size={14} style={{ color: '#f59e0b' }} />
                            <span style={{ flex: 1, fontSize: '0.82rem', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>📢 {activeAnn}</span>
                            <button onClick={() => setActiveAnn(null)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }}><X size={14} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
                    <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9' }}>
                        Admin <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Command Centre</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        Logged in as <span style={{ color: '#00ff41' }}>{user?.name}</span> <span style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>ADMIN</span>
                    </p>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '0.52rem 1.1rem', borderRadius: '7px', border: tab === t ? '1px solid rgba(0,255,65,0.35)' : '1px solid rgba(100,116,139,0.1)', background: tab === t ? 'rgba(0,255,65,0.08)' : 'rgba(0,0,0,0.2)', color: tab === t ? '#00ff41' : '#64748b', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: tab === t ? 700 : 400 }}>
                            {t} {t === 'Reports' && reports.filter(r => r.status === 'pending').length > 0 && <span style={{ background: '#ef4444', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', marginLeft: '0.3rem' }}>{reports.filter(r => r.status === 'pending').length}</span>}
                        </button>
                    ))}
                </div>

                {/* ─ Analytics ─ */}
                {tab === 'Analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {STAT_CARDS.map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}
                                    style={{ background: `${s.color}06`, border: `1px solid ${s.color}20`, borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
                                    <s.icon size={18} style={{ color: s.color, marginBottom: '0.6rem' }} />
                                    <div style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem', fontFamily: 'JetBrains Mono' }}>{s.sub}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                style={{ background: 'rgba(5,18,8,0.85)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: '12px', padding: '1.5rem' }}>
                                <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color: '#00ff41', marginBottom: '1.25rem' }}>7-Day Activity</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={ENGAGEMENT_DATA}>
                                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="posts" fill="#00ff41" radius={[3, 3, 0, 0]} name="Posts" />
                                        <Bar dataKey="logins" fill="#00d4ff" radius={[3, 3, 0, 0]} name="Logins" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                                style={{ background: 'rgba(0,5,20,0.85)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '12px', padding: '1.5rem' }}>
                                <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color: '#00d4ff', marginBottom: '1.25rem' }}>Member Domains</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <PieChart width={130} height={130}>
                                        <Pie data={DOMAIN_DATA} dataKey="value" cx={65} cy={65} innerRadius={35} outerRadius={55}>
                                            {DOMAIN_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                                        </Pie>
                                    </PieChart>
                                    <div style={{ flex: 1 }}>
                                        {DOMAIN_DATA.map(d => (
                                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{d.name}: {d.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ background: 'rgba(5,18,8,0.85)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color: '#00ff41', marginBottom: '1.25rem' }}>Event Registrations (7d)</h3>
                            <ResponsiveContainer width="100%" height={140}>
                                <LineChart data={ENGAGEMENT_DATA}>
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="events" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 3 }} name="Registrations" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─ Users ─ */}
                {tab === 'Users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {users.map((u, i) => {
                                const isAI = ['AI', 'ML', 'Data Science', 'Web3'].includes(u.domain)
                                const statusColor = { active: '#00ff41', muted: '#f59e0b', banned: '#ef4444' }[u.status]
                                return (
                                    <motion.div key={u.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                        style={{ background: isAI ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isAI ? 'linear-gradient(135deg,#00d4ff,#0096cc)' : 'linear-gradient(135deg,#00ff41,#00c853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#020d04' }}>
                                            {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: '160px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontWeight: 600, color: '#e8f5e9', fontSize: '0.85rem' }}>{u.name}</span>
                                                {u.role === 'admin' && <Crown size={11} style={{ color: '#f59e0b' }} />}
                                                <span style={{ fontSize: '0.6rem', color: statusColor, background: `${statusColor}12`, border: `1px solid ${statusColor}30`, borderRadius: '4px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>{u.status}</span>
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: '0.1rem' }}>{u.email} · {u.domain} · {u.posts} posts</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <motion.button whileHover={{ scale: 1.06 }} onClick={() => banUser(u.id)}
                                                style={{ padding: '0.32rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Ban size={10} /> {u.status === 'banned' ? 'Unban' : 'Ban'}
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.06 }} onClick={() => muteUser(u.id)}
                                                style={{ padding: '0.32rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)', color: '#f59e0b', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                {u.status === 'muted' ? 'Unmute' : 'Mute'}
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.06 }} onClick={() => promoteUser(u.id)}
                                                style={{ padding: '0.32rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)', color: '#00d4ff', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Crown size={9} /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ─ Reports ─ */}
                {tab === 'Reports' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {reports.map((r, i) => {
                                const sevColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#00ff41' }[r.severity]
                                return (
                                    <motion.div key={r.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                                        style={{ background: 'rgba(5,18,8,0.85)', border: r.status === 'resolved' ? '1px solid rgba(100,116,139,0.1)' : '1px solid rgba(239,68,68,0.12)', borderRadius: '10px', padding: '1.2rem', opacity: r.status === 'resolved' ? 0.6 : 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', color: sevColor, background: `${sevColor}10`, border: `1px solid ${sevColor}25`, borderRadius: '4px', padding: '0.06rem 0.32rem', fontFamily: 'JetBrains Mono' }}>{r.severity}</span>
                                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{r.type} · {r.time}</span>
                                                {r.status === 'resolved' && <span style={{ fontSize: '0.6rem', color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '4px', padding: '0.06rem 0.32rem', fontFamily: 'JetBrains Mono' }}>✅ Resolved</span>}
                                            </div>
                                            {r.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <motion.button whileHover={{ scale: 1.06 }} onClick={() => resolveReport(r.id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.7rem', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: '6px', color: '#00ff41', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                        <CheckCircle size={10} /> Resolve
                                                    </motion.button>
                                                    <motion.button whileHover={{ scale: 1.06 }}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.7rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                        <XCircle size={10} /> Dismiss
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{r.content}</p>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                                            Reported by <span style={{ color: '#00ff41' }}>{r.reporter}</span> → <span style={{ color: '#ef4444' }}>{r.reported}</span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ─ Resources ─ */}
                {tab === 'Resources' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: '#00d4ff', marginBottom: '1rem' }}>Pending Resource Submissions</h3>
                        {resources.length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'JetBrains Mono' }}>✅ No pending submissions</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            {resources.map((r, i) => (
                                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                    style={{ background: 'rgba(5,18,8,0.85)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#e8f5e9', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{r.title}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{r.type} · by {r.submittedBy}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <motion.button whileHover={{ scale: 1.06 }} onClick={() => approveResource(r.id, true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: '6px', color: '#00ff41', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                            <CheckCircle size={10} /> Approve
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.06 }} onClick={() => approveResource(r.id, false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                            <XCircle size={10} /> Reject
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ─ Announcements ─ */}
                {tab === 'Announcements' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px' }}>
                        <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: '#f59e0b', marginBottom: '1rem' }}>Push Site-Wide Announcement</h3>
                        <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ height: '2px', background: 'linear-gradient(90deg,#f59e0b,transparent)', marginTop: '-1.5rem', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginBottom: '1.5rem' }} />
                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.4rem' }}>ANNOUNCEMENT MESSAGE</label>
                            <textarea className="cyber-input" value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="e.g. 🚨 Server maintenance at 2:00 AM IST · New CTF event live now!" style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'Inter', marginBottom: '1rem', borderColor: 'rgba(245,158,11,0.2)' }} />
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { if (announcement.trim()) { setActiveAnn(announcement); setAnnouncement('') } }}
                                    style={{ flex: 1, padding: '0.75rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', color: '#f59e0b', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                    <Megaphone size={14} /> BROADCAST
                                </motion.button>
                                {activeAnn && <motion.button whileHover={{ scale: 1.03 }} onClick={() => setActiveAnn(null)}
                                    style={{ padding: '0.75rem 1rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer' }}>Clear</motion.button>}
                            </div>
                            {activeAnn && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>📢 Active: "{activeAnn}"</div>}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
