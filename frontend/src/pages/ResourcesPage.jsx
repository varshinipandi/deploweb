import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, Plus, X, ThumbsUp, ExternalLink, Filter, GitBranch, Check } from 'lucide-react'

const RESOURCE_TYPES = ['All', 'Free Course', 'YouTube', 'PDF', 'Roadmap', 'CTF Writeup', 'Research Paper', 'Interview Prep']
const CATEGORIES = ['All', 'AI/ML', 'Cybersecurity', 'Web Dev', 'Cloud Security', 'Reverse Engineering']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']

const RESOURCES = [
    { id: 1, title: 'Machine Learning Security by Google', type: 'Free Course', category: 'AI/ML', difficulty: 'Intermediate', desc: 'Comprehensive course on adversarial attacks, model robustness, and privacy-preserving ML. Includes hands-on labs with TensorFlow.', link: 'https://ai.google/', upvotes: 142, submittedBy: 'Ravi Nair' },
    { id: 2, title: 'PortSwigger Web Academy', type: 'Free Course', category: 'Cybersecurity', difficulty: 'Beginner', desc: 'The gold standard for learning web application security. 200+ labs covering XSS, SQLi, SSRF, deserialization, JWT, and more.', link: 'https://portswigger.net/web-security', upvotes: 298, submittedBy: 'Arya Sharma' },
    { id: 3, title: 'Hack The Box Writeups (2025)', type: 'CTF Writeup', category: 'Cybersecurity', difficulty: 'Advanced', desc: 'Collection of HTB machine writeups covering privilege escalation, Active Directory attacks, and binary exploitation techniques.', link: 'https://hackthebox.com/', upvotes: 87, submittedBy: 'Kiran Das' },
    { id: 4, title: 'Roadmap to AI Security Engineer', type: 'Roadmap', category: 'AI/ML', difficulty: 'Beginner', desc: 'Step-by-step learning path from Python basics → ML fundamentals → adversarial ML → deployment security. 12-month plan.', link: '#', upvotes: 201, submittedBy: 'Meera Pillai' },
    { id: 5, title: 'FastAPI Security Best Practices', type: 'PDF', category: 'Web Dev', difficulty: 'Intermediate', desc: 'Comprehensive PDF covering JWT best practices, CORS configuration, rate limiting with SlowAPI, and input validation with Pydantic.', link: '#', upvotes: 64, submittedBy: 'Deepak Rao' },
    { id: 6, title: 'Cloud Security Alliance CCSK Study Guide', type: 'PDF', category: 'Cloud Security', difficulty: 'Intermediate', desc: 'Official CCSK prep material covering cloud data security, infrastructure security, incident response, and compliance frameworks.', link: 'https://cloudsecurityalliance.org/', upvotes: 91, submittedBy: 'Sana Qureshi' },
    { id: 7, title: 'Reverse Engineering for Beginners', type: 'Free Course', category: 'Reverse Engineering', difficulty: 'Beginner', desc: 'Free 1000-page book covering assembly language, x86/x64 RE, disassemblers (IDA/Ghidra), and CTF binary challenges.', link: 'https://beginners.re/', upvotes: 176, submittedBy: 'Yash Trivedi' },
    { id: 8, title: 'Differential Privacy in Practice', type: 'Research Paper', category: 'AI/ML', difficulty: 'Advanced', desc: 'Apple\'s internal paper on deploying differential privacy in production ML systems. Detailed ε-δ privacy budget analysis.', link: '#', upvotes: 53, submittedBy: 'Ravi Nair' },
    { id: 9, title: 'Top 100 Cybersecurity Interview Questions', type: 'Interview Prep', category: 'Cybersecurity', difficulty: 'Intermediate', desc: 'Covers network security, cryptography, application security, SOC analyst questions, and penetration testing scenarios.', link: '#', upvotes: 168, submittedBy: 'Priya Mehta' },
    { id: 10, title: 'The Web Application Hacker\'s Handbook', type: 'PDF', category: 'Cybersecurity', difficulty: 'Advanced', desc: 'The definitive bible for web app hacking. Covers every attack class with technical depth and real-world examples.', link: '#', upvotes: 225, submittedBy: 'Arya Sharma' },
]

// Skill Tree data: Security=green, AI=blue
const SKILL_TREE = {
    'Web Security': { color: '#00ff41', nodes: ['HTTP/TLS Basics', 'OWASP Top 10', 'Burp Suite Pro', 'JWT Attacks', 'OAuth 2.0 Flaws', 'API Security', 'Web App Pentesting'] },
    'Machine Learning': { color: '#00d4ff', nodes: ['Python/NumPy', 'Scikit-learn', 'Neural Nets', 'Adversarial ML', 'Model Privacy', 'LLM Security', 'MLOps Security'] },
    'Reverse Engineering': { color: '#00ff41', nodes: ['x86 Assembly', 'Ghidra/IDA', 'Dynamic Analysis', 'Malware RE', 'Firmware Analysis', 'Anti-debug', 'Exploit Dev'] },
    'Cloud Security': { color: '#00d4ff', nodes: ['IAM & Policies', 'S3 Misconfigs', 'K8s Security', 'Lambda Security', 'CSPM Tools', 'Cloud Forensics', 'Zero Trust'] },
}

function SkillTree() {
    const [expanded, setExpanded] = useState(null)
    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <GitBranch size={17} style={{ color: '#00d4ff' }} />
                <h2 style={{ fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 800, color: '#e8f5e9' }}>Interactive Skill Tree</h2>
                <span style={{ fontSize: '0.62rem', color: '#00d4ff', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', padding: '0.06rem 0.35rem', fontFamily: 'JetBrains Mono' }}>Click to explore</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {Object.entries(SKILL_TREE).map(([path, { color, nodes }]) => {
                    const open = expanded === path
                    const isAI = ['Machine Learning', 'Cloud Security'].includes(path)
                    return (
                        <motion.div key={path} whileHover={{ y: -3 }} onClick={() => setExpanded(open ? null : path)}
                            style={{ background: isAI ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: `1px solid ${color}25`, borderRadius: '12px', padding: '1.1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color, marginBottom: open ? '0.85rem' : 0 }}>{path}</h3>
                            <AnimatePresence>
                                {open && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        {nodes.map((node, i) => (
                                            <div key={node} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', paddingLeft: `${i * 0.4}rem` }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0, opacity: 0.6 + i * 0.05 }} />
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{node}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!open && <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.3rem', fontFamily: 'JetBrains Mono' }}>{nodes.length} skills · tap to expand</p>}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default function ResourcesPage() {
    const [resources, setResources] = useState(RESOURCES)
    const [type, setType] = useState('All')
    const [category, setCategory] = useState('All')
    const [difficulty, setDifficulty] = useState('All')
    const [search, setSearch] = useState('')
    const [showSubmit, setShowSubmit] = useState(false)
    const [form, setForm] = useState({ title: '', desc: '', link: '', type: 'Free Course', category: 'AI/ML', difficulty: 'Beginner' })
    const [voted, setVoted] = useState({})
    const [sort, setSort] = useState('votes')

    const filtered = resources.filter(r => {
        if (type !== 'All' && r.type !== type) return false
        if (category !== 'All' && r.category !== category) return false
        if (difficulty !== 'All' && r.difficulty !== difficulty) return false
        if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.desc.toLowerCase().includes(search.toLowerCase())) return false
        return true
    }).sort((a, b) => sort === 'votes' ? b.upvotes - a.upvotes : a.title.localeCompare(b.title))

    const upvote = (id) => {
        if (voted[id]) return
        setVoted(v => ({ ...v, [id]: true }))
        setResources(rs => rs.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    }

    const submitResource = () => {
        if (!form.title.trim()) return
        setResources(rs => [{ id: Date.now(), ...form, upvotes: 0, submittedBy: 'You', status: 'pending' }, ...rs])
        setForm({ title: '', desc: '', link: '', type: 'Free Course', category: 'AI/ML', difficulty: 'Beginner' })
        setShowSubmit(false)
    }

    const typeColor = (t) => {
        const tm = { 'Free Course': '#00ff41', 'YouTube': '#f59e0b', 'PDF': '#00d4ff', 'Roadmap': '#00d4ff', 'CTF Writeup': '#00ff41', 'Research Paper': '#a78bfa', 'Interview Prep': '#f59e0b' }
        return tm[t] || '#94a3b8'
    }

    const diffColor = (d) => ({ Beginner: '#00ff41', Intermediate: '#f59e0b', Advanced: '#ef4444' }[d] || '#94a3b8')
    const catIsAI = (c) => ['AI/ML', 'Cloud Security'].includes(c)

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e8f5e9' }}>
                            Resource <span style={{ background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Library</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>Curated learning resources, roadmaps, and CTF writeups</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,65,0.3),0 0 60px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => setShowSubmit(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.3rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                        <Plus size={14} /> SUBMIT RESOURCE
                    </motion.button>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input className="cyber-input" placeholder="Search resources…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Filter size={12} style={{ color: '#64748b' }} />
                        {RESOURCE_TYPES.map(t => (
                            <button key={t} onClick={() => setType(t)}
                                style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', border: type === t ? '1px solid rgba(0,255,65,0.35)' : '1px solid rgba(100,116,139,0.1)', background: type === t ? 'rgba(0,255,65,0.08)' : 'rgba(0,0,0,0.2)', color: type === t ? '#00ff41' : '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setCategory(c)}
                                style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', border: category === c ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(100,116,139,0.1)', background: category === c ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.2)', color: category === c ? '#00d4ff' : '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                {c}
                            </button>
                        ))}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                            {DIFFICULTIES.map(d => (
                                <button key={d} onClick={() => setDifficulty(d)}
                                    style={{ padding: '0.28rem 0.6rem', borderRadius: '5px', border: difficulty === d ? `1px solid ${diffColor(d)}40` : '1px solid rgba(100,116,139,0.08)', background: difficulty === d ? `${diffColor(d)}0d` : 'transparent', color: difficulty === d ? diffColor(d) : '#64748b', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                    {d}
                                </button>
                            ))}
                            <select value={sort} onChange={e => setSort(e.target.value)} className="cyber-input" style={{ width: 'auto', minWidth: '110px', fontSize: '0.7rem' }}>
                                <option value="votes">Most Voted</option>
                                <option value="name">Alphabetical</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Resource Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                    {filtered.map((r, i) => {
                        const ai = catIsAI(r.category)
                        const tc = typeColor(r.type)
                        const dc = diffColor(r.difficulty)
                        const vd = voted[r.id]
                        return (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -4 }}
                                style={{ background: ai ? 'rgba(0,5,20,0.85)' : 'rgba(5,18,8,0.85)', border: ai ? '1px solid rgba(0,212,255,0.15)' : '1px solid rgba(0,255,65,0.12)', borderRadius: '12px', padding: '1.3rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ai ? '#00d4ff' : '#00ff41'}50,transparent)` }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.6rem', color: tc, background: `${tc}12`, border: `1px solid ${tc}30`, borderRadius: '4px', padding: '0.08rem 0.35rem', fontFamily: 'JetBrains Mono' }}>{r.type}</span>
                                        <span style={{ fontSize: '0.6rem', color: dc, background: `${dc}10`, border: `1px solid ${dc}25`, borderRadius: '4px', padding: '0.08rem 0.35rem', fontFamily: 'JetBrains Mono' }}>{r.difficulty}</span>
                                    </div>
                                    <a href={r.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                        style={{ color: ai ? '#00d4ff' : '#00ff41', display: 'flex' }}><ExternalLink size={13} /></a>
                                </div>
                                <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.5rem', lineHeight: 1.3 }}>{r.title}</h3>
                                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.65, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.desc}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>by {r.submittedBy}</span>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => upvote(r.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: vd ? 'rgba(0,255,65,0.1)' : 'none', border: vd ? '1px solid rgba(0,255,65,0.25)' : 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', color: vd ? '#00ff41' : '#64748b', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'JetBrains Mono' }}>
                                        <ThumbsUp size={12} style={{ color: vd ? '#00ff41' : '#64748b' }} /> {r.upvotes}
                                    </motion.button>
                                </div>
                                {r.status === 'pending' && <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', color: '#f59e0b', fontFamily: 'JetBrains Mono', borderTop: '1px solid rgba(245,158,11,0.15)', paddingTop: '0.4rem' }}>⏳ Pending admin approval</div>}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Skill Tree */}
                <SkillTree />
            </div>

            {/* Submit Resource Modal */}
            <AnimatePresence>
                {showSubmit && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSubmit(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,4,0.9)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
                            style={{ background: 'rgba(5,18,8,0.98)', border: '1px solid rgba(0,212,255,0.22)', borderRadius: '16px', maxWidth: '520px', width: '100%' }}>
                            <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00d4ff)', borderRadius: '16px 16px 0 0' }} />
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', fontWeight: 800, color: '#e8f5e9' }}>Submit Resource</h2>
                                    <button onClick={() => setShowSubmit(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    {[['TITLE', 'title', 'text', 'Name of the resource…'], ['LINK / URL', 'link', 'text', 'https://…'], ['DESCRIPTION', 'desc', 'textarea', 'Brief description…']].map(([lb, key, tp, ph]) => (
                                        <div key={key}>
                                            <label style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.35rem' }}>{lb}</label>
                                            {tp === 'textarea'
                                                ? <textarea className="cyber-input" placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ minHeight: '70px', resize: 'vertical', fontFamily: 'Inter' }} />
                                                : <input className="cyber-input" type={tp} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                                            }
                                        </div>
                                    ))}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        {[['TYPE', 'type', RESOURCE_TYPES.slice(1)], ['CATEGORY', 'category', CATEGORIES.slice(1)], ['DIFFICULTY', 'difficulty', DIFFICULTIES.slice(1)]].map(([lb, key, opts]) => (
                                            <div key={key}>
                                                <label style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'block', marginBottom: '0.3rem' }}>{lb}</label>
                                                <select className="cyber-input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ fontSize: '0.72rem' }}>
                                                    {opts.map(o => <option key={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={submitResource}
                                        style={{ padding: '0.82rem', background: 'linear-gradient(135deg,#00ff41,#00d4ff)', border: 'none', borderRadius: '8px', color: '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
                                        SUBMIT FOR REVIEW
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
