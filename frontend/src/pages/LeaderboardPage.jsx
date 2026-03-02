import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Wifi, ChevronDown, ChevronUp, Flame, CheckCircle, Clock, Star, Zap, Shield, Brain, Database, Code, Target, CalendarDays, BarChart2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import SpinWheel from '../components/SpinWheel'

/* ── Color constants ── */
const G = '#00ff41', B = '#00d4ff', A = '#f59e0b'

/* ── Domain config ── */
const DOMAINS = {
    AI: { color: B, icon: Brain, badge: '🧠', tasks: ['Build a text classifier', 'Fine-tune an LLM on custom data', 'Implement RAG pipeline', 'Deploy model with FastAPI', 'Add differential privacy'] },
    Cybersecurity: { color: G, icon: Shield, badge: '🛡️', tasks: ['Solve SQL injection lab', 'Capture JWT flag in CTF', 'Write XSS payload report', 'Enumerate with nmap & document', 'Complete OWASP Top-10 module'] },
    'Full Stack': { color: B, icon: Code, badge: '💻', tasks: ['Build REST API with auth', 'Deploy to Vercel + Render', 'Add WebSocket feature', 'Write E2E tests with Playwright', 'Implement rate limiting'] },
    'Data Science': { color: G, icon: Database, badge: '📊', tasks: ['EDA on public dataset', 'Build regression pipeline', 'Create interactive dashboard', 'Tune hyperparameters', 'Publish Kaggle notebook'] },
}

/* ── Tier config ── */
const TIERS = {
    Platinum: { min: 1000, color: B, glow: 'rgba(0,212,255,0.35)', icon: '💎' },
    Gold: { min: 500, color: A, glow: 'rgba(245,158,11,0.35)', icon: '🥇' },
    Silver: { min: 200, color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', icon: '🥈' },
    Bronze: { min: 0, color: '#b45309', glow: 'rgba(180,83,9,0.3)', icon: '🥉' },
}
function getTier(s) { return s >= 1000 ? 'Platinum' : s >= 500 ? 'Gold' : s >= 200 ? 'Silver' : 'Bronze' }

/* ── Scoring formula ── */
function calcScore(e) {
    const base = e.daily * 7 + e.weekly * 50 + e.monthly * 200 + e.wins * 50 + e.mentorship * 20
    const mul = e.streak >= 30 ? 2 : e.streak >= 7 ? 1.5 : 1
    const domainBonus = e.domainWins * 30
    return Math.round(base * mul + domainBonus)
}

/* ── Streak multiplier helper ── */
function getMultiplier(streak) { return streak >= 30 ? '2×' : streak >= 7 ? '1.5×' : '1×' }
function getMultiplierColor(streak) { return streak >= 30 ? A : streak >= 7 ? G : '#94a3b8' }

/* ── Mock leaderboard data ── */
const MOCK = [
    { id: 1, name: 'Arya Sharma', av: 'AS', domain: 'Cybersecurity', daily: 14, weekly: 6, monthly: 2, wins: 3, mentorship: 8, streak: 34, longestStreak: 42, domainWins: 5, challenge: '100-Day', challengeDay: 34 },
    { id: 2, name: 'Ravi Nair', av: 'RN', domain: 'AI', daily: 12, weekly: 5, monthly: 2, wins: 2, mentorship: 5, streak: 22, longestStreak: 28, domainWins: 3, challenge: '60-Day', challengeDay: 22 },
    { id: 3, name: 'Priya Mehta', av: 'PM', domain: 'Full Stack', daily: 18, weekly: 7, monthly: 1, wins: 1, mentorship: 12, streak: 9, longestStreak: 15, domainWins: 2, challenge: '60-Day', challengeDay: 9 },
    { id: 4, name: 'Kiran Das', av: 'KD', domain: 'Data Science', daily: 8, weekly: 3, monthly: 1, wins: 0, mentorship: 6, streak: 5, longestStreak: 12, domainWins: 1, challenge: null, challengeDay: 0 },
    { id: 5, name: 'Sana Qureshi', av: 'SQ', domain: 'Cybersecurity', daily: 10, weekly: 4, monthly: 1, wins: 1, mentorship: 3, streak: 7, longestStreak: 9, domainWins: 2, challenge: '60-Day', challengeDay: 7 },
    { id: 6, name: 'Deepak Rao', av: 'DR', domain: 'Full Stack', daily: 7, weekly: 2, monthly: 0, wins: 0, mentorship: 4, streak: 3, longestStreak: 8, domainWins: 0, challenge: null, challengeDay: 0 },
    { id: 7, name: 'Meera Pillai', av: 'MP', domain: 'AI', daily: 9, weekly: 4, monthly: 1, wins: 1, mentorship: 2, streak: 14, longestStreak: 18, domainWins: 1, challenge: '100-Day', challengeDay: 14 },
    { id: 8, name: 'Yash Trivedi', av: 'YT', domain: 'Data Science', daily: 5, weekly: 2, monthly: 0, wins: 0, mentorship: 1, streak: 2, longestStreak: 5, domainWins: 0, challenge: null, challengeDay: 0 },
]

/* ── Domain avatar gradient ── */
function domCol(d) { return ['AI', 'Data Science'].includes(d) ? { from: B, to: '#0099cc' } : { from: G, to: '#00c853' } }

/* ── Daily / Weekly / Monthly tasks ── */
const DAILY_TASKS = [
    { id: 1, title: 'Complete a LeetCode/HackTheBox challenge', pts: 7, deadline: 'Today 23:59', domain: 'all', done: false },
    { id: 2, title: 'Review one CVE or AI paper', pts: 5, deadline: 'Today 23:59', domain: 'all', done: false },
    { id: 3, title: 'Write a post on Community Feed', pts: 6, deadline: 'Today 23:59', domain: 'all', done: true },
    { id: 4, title: 'Fix an open-source bug', pts: 10, deadline: 'Today 23:59', domain: 'Full Stack', done: false },
    { id: 5, title: 'Run a port scan + write findings', pts: 8, deadline: 'Today 23:59', domain: 'Cybersecurity', done: false },
]
const WEEKLY_TASKS = [
    { id: 10, title: 'Complete one full CTF challenge', pts: 50, deadline: 'Sun 23:59', domain: 'Cybersecurity', done: false },
    { id: 11, title: 'Deploy an ML model to production', pts: 50, deadline: 'Sun 23:59', domain: 'AI', done: false },
    { id: 12, title: 'Publish a data analysis notebook', pts: 50, deadline: 'Sun 23:59', domain: 'Data Science', done: false },
    { id: 13, title: 'Ship a full-stack feature with tests', pts: 50, deadline: 'Sun 23:59', domain: 'Full Stack', done: false },
]
const MONTHLY_CHALLENGES = [
    { id: 20, title: 'Win or place Top-10 in any CTF', pts: 300, deadline: 'Mar 31', domain: 'Cybersecurity', done: false },
    { id: 21, title: 'Publish a research paper / blog on AI safety', pts: 200, deadline: 'Mar 31', domain: 'AI', done: false },
    { id: 22, title: 'Build & deploy a full project to production', pts: 250, deadline: 'Mar 31', domain: 'Full Stack', done: false },
    { id: 23, title: 'Win a Kaggle competition (any tier)', pts: 150, deadline: 'Mar 31', domain: 'Data Science', done: false },
]

const SEASONS = ['All Time', 'This Month', 'This Week', '🏆 Hall of Fame']
const TABS = ['🏆 Leaderboard', '⚔️ Challenges', '🔥 My Journey', '🚀 Antigravity']

export default function LeaderboardPage() {
    const { user: me } = useSelector(s => s.auth)
    const myDomain = me?.domain || 'Cybersecurity'

    const [entries, setEntries] = useState(() =>
        MOCK.map(e => ({ ...e, score: calcScore(e) })).sort((a, b) => b.score - a.score)
    )
    const [tab, setTab] = useState('🏆 Leaderboard')
    const [season, setSeason] = useState('All Time')
    const [spinOpen, setSpinOpen] = useState(false)
    const [bonusPts, setBonusPts] = useState(0)
    const [expanded, setExpanded] = useState(null)
    const [daily, setDaily] = useState(DAILY_TASKS)
    const [weekly, setWeekly] = useState(WEEKLY_TASKS)
    const [monthly, setMonthly] = useState(MONTHLY_CHALLENGES)
    const [enrolled, setEnrolled] = useState(null)   // '60-Day' | '100-Day' | null
    const [myStreak, setMyStreak] = useState(7)
    const [myDay, setMyDay] = useState(7)
    const [todayDone, setTodayDone] = useState(false)

    /* live ticker */
    useEffect(() => {
        if (season === '🏆 Hall of Fame') return
        const id = setInterval(() => {
            setEntries(prev =>
                prev.map(e => ({ ...e, score: e.score + Math.floor(Math.random() * 3) }))
                    .sort((a, b) => b.score - a.score)
            )
        }, 6000)
        return () => clearInterval(id)
    }, [season])

    const completeTask = (list, setList, taskId) => {
        setList(list.map(t => t.id === taskId ? { ...t, done: true } : t))
    }

    const dCol = DOMAINS[myDomain]?.color || G
    const podium = entries.slice(0, 3)
    const rest = entries.slice(3)

    /* ─────────────────────────────── RENDER ─────────────────────────────── */
    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.2rem 4rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ── SpinWheel panel ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1rem', background: 'rgba(5,18,8,0.85)', border: `1px solid ${G}25`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '2px', background: `linear-gradient(90deg,${G},${B})` }} />
                    <button onClick={() => setSpinOpen(!spinOpen)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span style={{ fontFamily: 'Orbitron', fontSize: '0.83rem', fontWeight: 700, color: '#e8f5e9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={14} style={{ color: G }} /> Daily XP Bonus Wheel
                            {bonusPts > 0 && <span style={{ fontSize: '0.68rem', color: G, fontFamily: 'JetBrains Mono' }}>+{bonusPts} pts today</span>}
                        </span>
                        {spinOpen ? <ChevronUp size={14} style={{ color: '#64748b' }} /> : <ChevronDown size={14} style={{ color: '#64748b' }} />}
                    </button>
                    <AnimatePresence>
                        {spinOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid rgba(0,255,65,0.06)' }}>
                                <SpinWheel onWin={p => setBonusPts(b => b + p)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Page header ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.75rem', fontWeight: 900, color: '#e8f5e9', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Trophy size={28} style={{ color: A }} /> Global <span style={{ background: `linear-gradient(135deg,${G},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Leaderboard</span>
                            </h1>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>Domain-Aware · Streak-Powered · Real-Time</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Wifi size={10} style={{ color: G }} />
                            <span style={{ fontSize: '0.65rem', color: G, fontFamily: 'JetBrains Mono', animation: 'pulse 2s infinite' }}>LIVE · EVERY 6s</span>
                        </div>
                    </div>

                    {/* Scoring formula */}
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: `rgba(245,158,11,0.04)`, border: '1px solid rgba(245,158,11,0.12)', borderRadius: '8px', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        Score = (<span style={{ color: G }}>Daily×7</span> + <span style={{ color: B }}>Weekly×50</span> + <span style={{ color: '#a78bfa' }}>Monthly×200</span> + <span style={{ color: A }}>Wins×50</span> + <span style={{ color: G }}>Mentorship×20</span> + <span style={{ color: B }}>DomainWins×30</span>) × <span style={{ color: A }}>StreakMultiplier</span>
                    </div>

                    {/* Seasonal tabs */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        {SEASONS.map(s => (
                            <button key={s} onClick={() => setSeason(s)}
                                style={{ padding: '0.32rem 0.7rem', borderRadius: '6px', border: season === s ? `1px solid ${B}40` : '1px solid rgba(100,116,139,0.1)', background: season === s ? `${B}0d` : 'rgba(0,0,0,0.2)', color: season === s ? B : '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Main tabs ── */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: tab === t ? `1px solid ${G}35` : '1px solid rgba(100,116,139,0.08)', background: tab === t ? `${G}09` : 'rgba(0,0,0,0.2)', color: tab === t ? G : '#64748b', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: tab === t ? 700 : 400 }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* ══════════ TAB 1: LEADERBOARD ══════════ */}
                {tab === '🏆 Leaderboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Tier legend */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            {Object.entries(TIERS).map(([name, t]) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: `${t.color}09`, border: `1px solid ${t.color}22`, borderRadius: '6px', padding: '0.28rem 0.65rem' }}>
                                    <span style={{ fontSize: '0.75rem' }}>{t.icon}</span>
                                    <span style={{ fontSize: '0.65rem', color: t.color, fontFamily: 'JetBrains Mono' }}>{name} ≥{t.min}</span>
                                </div>
                            ))}
                        </div>

                        {/* Podium top-3 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                            {[podium[1], podium[0], podium[2]].map((e, i) => {
                                if (!e) return <div key={i} />
                                const rank = i === 1 ? 1 : i === 0 ? 2 : 3
                                const tier = TIERS[getTier(e.score)]
                                const dc = domCol(e.domain)
                                const mul = getMultiplier(e.streak)
                                return (
                                    <motion.div key={e.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                                        style={{ background: 'rgba(5,15,10,0.92)', border: `1px solid ${tier.color}30`, borderRadius: '12px', padding: '1.2rem 0.85rem', textAlign: 'center', boxShadow: `0 0 ${rank === 1 ? '30px' : '18px'} ${tier.glow}`, position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${tier.color},transparent)` }} />
                                        <div style={{ fontSize: rank === 1 ? '1.6rem' : '1.2rem', marginBottom: '0.4rem' }}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                                        <div style={{ width: rank === 1 ? '52px' : '44px', height: rank === 1 ? '52px' : '44px', borderRadius: '50%', background: `linear-gradient(135deg,${dc.from},${dc.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#020d04', margin: '0 auto 0.6rem', boxShadow: `0 0 14px ${dc.from}50` }}>
                                            {e.av}
                                        </div>
                                        <div style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color: '#e8f5e9', marginBottom: '0.15rem' }}>{e.name}</div>
                                        <div style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.5rem' }}>{e.domain}</div>
                                        <div style={{ fontFamily: 'Orbitron', fontSize: '1.3rem', fontWeight: 900, color: tier.color }}>{e.score.toLocaleString()}</div>
                                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.58rem', color: G, background: `${G}10`, border: `1px solid ${G}25`, borderRadius: '4px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>🔥{e.streak}d</span>
                                            <span style={{ fontSize: '0.58rem', color: getMultiplierColor(e.streak), background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>{mul}</span>
                                            {e.challenge && <span style={{ fontSize: '0.58rem', color: A, background: `${A}10`, border: `1px solid ${A}25`, borderRadius: '4px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>{e.challenge}</span>}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Rank rows 4+ */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                            {rest.map((e, i) => {
                                const rank = i + 4; const tier = TIERS[getTier(e.score)]; const dc = domCol(e.domain)
                                const open = expanded === e.id; const mul = getMultiplier(e.streak)
                                return (
                                    <motion.div key={e.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        style={{ background: 'rgba(5,15,10,0.85)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.1rem', cursor: 'pointer' }} onClick={() => setExpanded(open ? null : e.id)}>
                                            <div style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: '#64748b', minWidth: '24px', textAlign: 'center' }}>#{rank}</div>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg,${dc.from},${dc.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#020d04', flexShrink: 0 }}>{e.av}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, color: '#e8f5e9', fontSize: '0.85rem' }}>{e.name} <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{e.domain}</span></div>
                                                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.6rem', color: G, fontFamily: 'JetBrains Mono' }}>🔥 {e.streak}d streak</span>
                                                    <span style={{ fontSize: '0.6rem', color: getMultiplierColor(e.streak), fontFamily: 'JetBrains Mono' }}>{mul} mult</span>
                                                    {e.challenge && <span style={{ fontSize: '0.6rem', color: A, fontFamily: 'JetBrains Mono' }}>{e.challenge} Day {e.challengeDay}</span>}
                                                </div>
                                            </div>
                                            <div style={{ fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 900, color: tier.color }}>{e.score.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.75rem' }}>{tier.icon}</div>
                                            {open ? <ChevronUp size={13} style={{ color: '#64748b' }} /> : <ChevronDown size={13} style={{ color: '#64748b' }} />}
                                        </div>
                                        <AnimatePresence>
                                            {open && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '0.75rem 1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.5rem' }}>
                                                        {[
                                                            { label: 'Current Streak', val: `🔥 ${e.streak}d`, c: G },
                                                            { label: 'Longest Streak', val: `⚡ ${e.longestStreak}d`, c: A },
                                                            { label: 'Domain Rank', val: `#${i + 1} ${e.domain.slice(0, 3)}`, c: B },
                                                            { label: 'Domain Wins', val: `${e.domainWins} wins`, c: G },
                                                            { label: 'Multiplier', val: mul, c: getMultiplierColor(e.streak) },
                                                            { label: 'Active Challenge', val: e.challenge || '—', c: A },
                                                        ].map(({ label, val, c }) => (
                                                            <div key={label} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '7px', padding: '0.5rem 0.65rem' }}>
                                                                <div style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.2rem' }}>{label}</div>
                                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: c, fontFamily: 'Orbitron' }}>{val}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 2: CHALLENGES ══════════ */}
                {tab === '⚔️ Challenges' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* My domain banner */}
                        <div style={{ padding: '0.75rem 1.1rem', background: `${dCol}0a`, border: `1px solid ${dCol}20`, borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Target size={15} style={{ color: dCol }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: dCol }}>Showing challenges for domain: <strong>{myDomain}</strong></span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>Domain XP tasks highlighted</span>
                        </div>

                        {/* Daily */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <CalendarDays size={15} style={{ color: G }} /><h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: G }}>Daily Tasks</h3>
                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginLeft: 'auto' }}>Resets midnight IST</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {daily.map(t => {
                                    const isMine = t.domain === 'all' || t.domain === myDomain
                                    return (
                                        <motion.div key={t.id} whileHover={{ x: 2 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.1rem', background: t.done ? 'rgba(0,255,65,0.04)' : 'rgba(5,18,8,0.85)', border: t.done ? `1px solid ${G}25` : isMine ? `1px solid ${G}18` : '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', opacity: isMine ? 1 : 0.55 }}>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => completeTask(daily, setDaily, t.id)} disabled={t.done}
                                                style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${t.done ? G : 'rgba(0,255,65,0.3)'}`, background: t.done ? `${G}20` : 'transparent', color: G, cursor: t.done ? 'default' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t.done && <CheckCircle size={12} />}
                                            </motion.button>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', color: t.done ? '#64748b' : '#e8f5e9', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                                                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                                                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={8} />{t.deadline}</span>
                                                    {t.domain !== 'all' && <span style={{ fontSize: '0.6rem', color: dCol, background: `${dCol}10`, borderRadius: '3px', padding: '0.02rem 0.25rem', fontFamily: 'JetBrains Mono' }}>{t.domain}</span>}
                                                </div>
                                            </div>
                                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: t.done ? '#64748b' : G }}>+{t.pts} XP</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Weekly */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Star size={15} style={{ color: B }} /><h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: B }}>Weekly Tasks</h3>
                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginLeft: 'auto' }}>+50 XP each</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {weekly.map(t => {
                                    const isMine = t.domain === myDomain
                                    return (
                                        <motion.div key={t.id} whileHover={{ x: 2 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.1rem', background: t.done ? `${B}05` : 'rgba(0,5,20,0.85)', border: t.done ? `1px solid ${B}25` : isMine ? `1px solid ${B}20` : '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', opacity: isMine ? 1 : 0.6 }}>
                                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => completeTask(weekly, setWeekly, t.id)} disabled={t.done}
                                                style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${t.done ? B : 'rgba(0,212,255,0.3)'}`, background: t.done ? `${B}20` : 'transparent', color: B, cursor: t.done ? 'default' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t.done && <CheckCircle size={12} />}
                                            </motion.button>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', color: t.done ? '#64748b' : '#e8f5e9', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                                                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                                                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={8} />{t.deadline}</span>
                                                    <span style={{ fontSize: '0.6rem', color: B, background: `${B}10`, borderRadius: '3px', padding: '0.02rem 0.25rem', fontFamily: 'JetBrains Mono' }}>{t.domain}</span>
                                                </div>
                                            </div>
                                            <span style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: t.done ? '#64748b' : B }}>+50 XP</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Monthly */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <BarChart2 size={15} style={{ color: '#a78bfa' }} /><h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: '#a78bfa' }}>Monthly Challenges</h3>
                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginLeft: 'auto' }}>150–300 XP · March 2026</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
                                {monthly.map(t => {
                                    const isMine = t.domain === myDomain
                                    return (
                                        <motion.div key={t.id} whileHover={{ y: -3 }}
                                            style={{ background: 'rgba(5,5,20,0.88)', border: isMine ? '1px solid rgba(167,139,250,0.22)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1.1rem', position: 'relative', overflow: 'hidden', opacity: isMine ? 1 : 0.55 }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#a78bfa,transparent)' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                                <span style={{ fontSize: '0.62rem', color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '4px', padding: '0.05rem 0.3rem', fontFamily: 'JetBrains Mono' }}>{t.domain}</span>
                                                <span style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', fontWeight: 900, color: '#a78bfa' }}>+{t.pts}</span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#e8f5e9', marginBottom: '0.5rem', lineHeight: 1.4 }}>{t.title}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={9} />Ends {t.deadline}</span>
                                                <motion.button whileHover={{ scale: 1.05 }} onClick={() => completeTask(monthly, setMonthly, t.id)} disabled={t.done}
                                                    style={{ padding: '0.28rem 0.65rem', background: t.done ? `${G}10` : 'rgba(167,139,250,0.08)', border: t.done ? `1px solid ${G}25` : '1px solid rgba(167,139,250,0.25)', borderRadius: '5px', color: t.done ? G : '#a78bfa', fontSize: '0.65rem', cursor: t.done ? 'default' : 'pointer', fontFamily: 'JetBrains Mono' }}>
                                                    {t.done ? '✅ Done' : 'Mark Complete'}
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 3: MY JOURNEY ══════════ */}
                {tab === '🔥 My Journey' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            {/* Streak card */}
                            <div style={{ background: 'rgba(5,18,8,0.9)', border: `1px solid ${G}22`, borderRadius: '12px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${G},transparent)` }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    <Flame size={18} style={{ color: G }} />
                                    <span style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color: G }}>STREAK ENGINE</span>
                                </div>
                                <div style={{ fontFamily: 'Orbitron', fontSize: '3rem', fontWeight: 900, color: G, lineHeight: 1 }}>{myStreak}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>consecutive days</div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {[[7, '1.5× multiplier', A], [30, '2× multiplier', '#a78bfa']].map(([d, label, c]) => (
                                        <div key={d} style={{ flex: 1, padding: '0.5rem', background: myStreak >= d ? `${c}10` : 'rgba(0,0,0,0.2)', border: `1px solid ${myStreak >= d ? c + '40' : 'rgba(255,255,255,0.05)'}`, borderRadius: '7px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', color: myStreak >= d ? c : '#64748b', fontFamily: 'JetBrains Mono' }}>{d}+ days</div>
                                            <div style={{ fontSize: '0.72rem', color: myStreak >= d ? c : '#64748b', fontWeight: 700 }}>{label}</div>
                                            {myStreak >= d && <div style={{ fontSize: '0.6rem', color: c, fontFamily: 'JetBrains Mono' }}>✓ ACTIVE</div>}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono', padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '5px' }}>
                                    ⚠ Streak resets after <span style={{ color: '#ef4444' }}>3 missed days</span>
                                </div>
                            </div>

                            {/* Challenge mode card */}
                            <div style={{ background: 'rgba(0,5,20,0.9)', border: `1px solid ${B}22`, borderRadius: '12px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${B},transparent)` }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                                    <Target size={18} style={{ color: B }} />
                                    <span style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color: B }}>CHALLENGE MODE</span>
                                </div>
                                {enrolled ? (
                                    <div>
                                        <div style={{ fontFamily: 'Orbitron', fontSize: '1.6rem', fontWeight: 900, color: B }}>{myDay}<span style={{ fontSize: '0.9rem', color: '#64748b' }}> / {enrolled === '60-Day' ? 60 : 100}</span></div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginBottom: '0.75rem' }}>{enrolled} · day {myDay}</div>
                                        {/* Progress bar */}
                                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(myDay / (enrolled === '60-Day' ? 60 : 100)) * 100}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                                                style={{ height: '100%', background: `linear-gradient(90deg,${G},${B})`, borderRadius: '3px', boxShadow: `0 0 8px ${G}50` }} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#e8f5e9', marginBottom: '0.75rem' }}>Today's task: <span style={{ color: B, fontFamily: 'JetBrains Mono' }}>{DOMAINS[myDomain].tasks[myDay % 5]}</span></div>
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={todayDone}
                                            onClick={() => { setTodayDone(true); setMyStreak(s => s + 1); setMyDay(d => d + 1) }}
                                            style={{ width: '100%', padding: '0.6rem', background: todayDone ? 'rgba(0,0,0,0.2)' : `linear-gradient(135deg,${G},${B})`, border: todayDone ? `1px solid ${G}20` : 'none', borderRadius: '7px', color: todayDone ? '#64748b' : '#020d04', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.78rem', cursor: todayDone ? 'default' : 'pointer' }}>
                                            {todayDone ? '✅ Done for today' : 'Mark Day Complete +10 XP'}
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>Join a continuous challenge to earn a streak multiplier and exclusive domain badges.</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {['60-Day', '100-Day'].map(m => (
                                                <motion.button key={m} whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${B}25` }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => { setEnrolled(m); setMyDay(1); setMyStreak(1) }}
                                                    style={{ padding: '0.7rem', background: `${B}09`, border: `1px solid ${B}25`, borderRadius: '8px', color: B, fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>{m} Challenge</span>
                                                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{m === '60-Day' ? '≤3 miss' : '≤3 miss · 2× bonus'}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>Daily domain tasks · Streak multiplier · Exclusive badge</div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My domain tasks */}
                        <div style={{ background: 'rgba(5,18,8,0.85)', border: `1px solid ${dCol}18`, borderRadius: '12px', padding: '1.25rem' }}>
                            <div style={{ height: '2px', background: `linear-gradient(90deg,${dCol},transparent)`, margin: '-1.25rem -1.25rem 1rem' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                                <span style={{ fontSize: '1rem' }}>{DOMAINS[myDomain]?.badge}</span>
                                <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700, color: dCol }}>{myDomain} Domain Task Library</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {DOMAINS[myDomain]?.tasks.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '7px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${dCol}15`, border: `1px solid ${dCol}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: dCol, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: dCol, fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>{i < 2 ? 'Daily' : i < 4 ? 'Weekly' : 'Monthly'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 4: ANTIGRAVITY ══════════ */}
                {tab === '🚀 Antigravity' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Hero concept */}
                        <div style={{ background: 'rgba(0,5,20,0.92)', border: `1px solid ${B}22`, borderRadius: '14px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,${G},${B},${G})` }} />
                            <div style={{ fontSize: '3rem', marginBottom: '0.6rem' }}>🚀</div>
                            <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 900, background: `linear-gradient(135deg,${G},${B})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.6rem' }}>Antigravity Challenge Engine</h2>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto' }}>
                                Traditional community platforms suffer from engagement gravity — the natural tendency for participation to fade over time. This system <span style={{ color: G }}>removes that friction</span> by making every action count, every streak rewarded, and every domain win celebrated in real time.
                            </p>
                        </div>

                        {/* Info grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[
                                { icon: '🔥', title: 'Streak Gravity Inversion', color: G, body: 'Missing once shouldn\'t kill motivation. 3-miss buffer lets life happen while keeping momentum alive. After 7 days you literally earn more points per action.' },
                                { icon: '🧠', title: 'Domain-Aware Scoring', color: B, body: 'A Cybersecurity student earns points through CTFs and CVE research. An AI student earns through model deployments. Your domain defines your path — no one-size-fits-all grind.' },
                                { icon: '⚡', title: 'Multiplier Lift', color: A, body: '7 days = 1.5× multiplier. 30 days = 2× multiplier. Long-term consistency compounds into leaderboard dominance. This is how top performers lift off.' },
                                { icon: '🎯', title: '60/100 Day Escape Velocity', color: '#a78bfa', body: 'Joining a 60 or 100-day challenge creates a commitment contract with yourself. Daily task completion builds a habit loop that self-sustains beyond the challenge.' },
                            ].map(({ icon, title, color, body }) => (
                                <motion.div key={title} whileHover={{ y: -4 }} style={{ background: 'rgba(5,15,10,0.88)', border: `1px solid ${color}18`, borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${color},transparent)` }} />
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                                    <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color, marginBottom: '0.5rem' }}>{title}</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.65 }}>{body}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Backend schema */}
                        <div style={{ background: 'rgba(5,18,8,0.9)', border: `1px solid ${G}18`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ height: '2px', background: `linear-gradient(90deg,${G},${B})`, margin: '-1.5rem -1.5rem 1.2rem' }} />
                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: G, marginBottom: '1rem' }}>📊 Database Schema</h3>
                            <pre style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{`Challenges        → id, title, domain, type(daily/weekly/monthly), points, deadline
UserChallengeProgress → user_id, challenge_id, completed_at, points_earned
StreakTracking    → user_id, current_streak, longest_streak, last_active,
                    miss_count(reset at 3), multiplier(1|1.5|2)
DomainRanking     → user_id, domain, domain_score, domain_rank, wins
Leaderboard       → user_id, total_score, global_rank, season, updated_at`}</pre>
                        </div>

                        {/* API routes */}
                        <div style={{ background: 'rgba(0,5,20,0.9)', border: `1px solid ${B}18`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ height: '2px', background: `linear-gradient(90deg,${B},${G})`, margin: '-1.5rem -1.5rem 1.2rem' }} />
                            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', fontWeight: 700, color: B, marginBottom: '1rem' }}>⚡ API Routes (FastAPI)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {[
                                    ['GET', '/leaderboard?season=&domain=', 'Global / domain-filtered leaderboard'],
                                    ['GET', '/challenges?domain=&type=', 'List challenges by domain + type'],
                                    ['POST', '/challenges/{id}/complete', 'Mark challenge complete → update streak'],
                                    ['GET', '/users/{id}/streak', 'Current streak, multiplier, miss count'],
                                    ['POST', '/challenges/enroll', 'Enroll in 60-Day or 100-Day mode'],
                                    ['GET', '/leaderboard/domain/{domain}', 'Domain-specific ranking'],
                                    ['WS', 'ws://api/leaderboard/live', 'WebSocket live score ticker'],
                                    ['GET', '/users/{id}/spin', 'Daily XP spin (Redis 24h TTL)'],
                                ].map(([method, route, desc]) => (
                                    <div key={route} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <span style={{ fontSize: '0.62rem', color: method === 'GET' ? G : method === 'WS' ? A : B, background: method === 'GET' ? `${G}0d` : method === 'WS' ? `${A}0d` : `${B}0d`, border: `1px solid ${method === 'GET' ? G : method === 'WS' ? A : B}25`, borderRadius: '3px', padding: '0.06rem 0.3rem', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>{method}</span>
                                        <span style={{ fontSize: '0.72rem', color: '#e8f5e9', fontFamily: 'JetBrains Mono', flex: 1 }}>{route}</span>
                                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Real-time + Deployment */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(5,18,8,0.88)', border: `1px solid ${G}15`, borderRadius: '10px', padding: '1.1rem' }}>
                                <h4 style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', color: G, marginBottom: '0.75rem' }}>🔴 Real-Time Design</h4>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>
                                    {['WebSocket → broadcast score delta every 6s', 'Redis pub/sub → fan-out to connected clients', 'Score cached in Redis (5-min TTL)', 'PostgreSQL write-through on task completion', 'React re-renders only changed rows (keyed)'].map(l => <div key={l}>• {l}</div>)}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(0,5,20,0.88)', border: `1px solid ${B}15`, borderRadius: '10px', padding: '1.1rem' }}>
                                <h4 style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', color: B, marginBottom: '0.75rem' }}>☁️ Deployment</h4>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>
                                    {['Frontend → Vercel (Next.js / React)', 'Backend → Render (FastAPI + Uvicorn)', 'DB → Supabase PostgreSQL (free tier)', 'Cache → Upstash Redis (serverless)', 'Midnight cron → reset daily tasks'].map(l => <div key={l}>• {l}</div>)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    )
}
