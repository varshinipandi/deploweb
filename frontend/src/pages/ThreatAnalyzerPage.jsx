import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, Search, Code, Terminal, Zap, Link as LinkIcon, FileText, RefreshCw } from 'lucide-react'

// Same rule engine as backend — 10 OWASP patterns
const THREAT_RULES = [
    { pattern: /(['"])\s*or\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i, category: 'SQL Injection', level: 'Critical', mitigation: 'Use parameterized queries or an ORM. Never interpolate user input into SQL strings.', owasp: 'A03:2021' },
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, category: 'XSS (Stored/Reflected)', level: 'High', mitigation: 'Sanitize all user input. Set Content-Security-Policy and escape HTML entities.', owasp: 'A03:2021' },
    { pattern: /password\s*=\s*['"][^'"]{3,}/i, category: 'Hardcoded Credential', level: 'Critical', mitigation: 'Move secrets to environment variables or a secrets manager (Vault, AWS Secrets Manager).', owasp: 'A02:2021' },
    { pattern: /eval\s*\(/i, category: 'Code Injection Risk', level: 'High', mitigation: 'Avoid eval(). Use JSON.parse() for data or structured alternatives.', owasp: 'A03:2021' },
    { pattern: /exec\s*\(|os\.system\s*\(|subprocess\.call/i, category: 'Command Injection', level: 'Critical', mitigation: 'Use subprocess with argument lists, never shell=True. Never execute user-controlled commands.', owasp: 'A03:2021' },
    { pattern: /ssrf|fetch.*localhost|http:\/\/169\.254/i, category: 'SSRF Indicator', level: 'High', mitigation: 'Validate and whitelist all external URLs. Block private IP ranges (10.x, 172.x, 192.168.x).', owasp: 'A10:2021' },
    { pattern: /\.\.\//i, category: 'Path Traversal', level: 'High', mitigation: 'Sanitize all file paths. Use os.path.abspath() and verify paths are within allowed directories.', owasp: 'A01:2021' },
    { pattern: /md5\s*\(|sha1\s*\(/i, category: 'Weak Cryptography', level: 'Medium', mitigation: 'Use SHA-256+ for hashing. Use bcrypt or Argon2 for passwords. MD5/SHA1 are cryptographically broken.', owasp: 'A02:2021' },
    { pattern: /jwt\.decode.*verify.*false|algorithm.*none/i, category: 'JWT None Algorithm', level: 'Critical', mitigation: 'Always verify JWT signatures. Never allow algorithm=none. Enforce HS256/RS256.', owasp: 'A02:2021' },
    { pattern: /cors.*\*|Access-Control-Allow-Origin.*\*/i, category: 'Permissive CORS', level: 'Medium', mitigation: 'Restrict CORS to known, trusted origins only. Never use wildcard (*) in production.', owasp: 'A05:2021' },
]

const LEVEL_CONFIG = {
    Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', icon: '🚨', score: 90 },
    High: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)', icon: '🔴', score: 70 },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', icon: '🟡', score: 45 },
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', icon: '🟢', score: 20 },
    Clean: { color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', icon: '✅', score: 0 },
}

function analyze(text) {
    const findings = THREAT_RULES.filter(r => r.pattern.test(text))
    if (!findings.length) return { level: 'Clean', score: 0, findings: [], summary: 'No obvious vulnerabilities detected. Content appears clean.' }
    const maxScore = Math.max(...findings.map(f => LEVEL_CONFIG[f.level]?.score || 0))
    const dominant = findings.find(f => LEVEL_CONFIG[f.level]?.score === maxScore)
    return { level: dominant.level, score: maxScore, findings, summary: `${findings.length} potential vulnerability pattern${findings.length > 1 ? 's' : ''} detected.` }
}

// Score ring progress circle
function ScoreRing({ score, level }) {
    const cfg = LEVEL_CONFIG[level]
    const r = 44, circ = 2 * Math.PI * r
    const stroke = circ - (score / 100) * circ
    return (
        <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
                <motion.circle cx="55" cy="55" r={r} stroke={cfg.color} strokeWidth="10" fill="none"
                    strokeDasharray={circ} strokeLinecap="round"
                    initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: stroke }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 900, color: cfg.color }}
                >{score}</motion.div>
                <div style={{ fontSize: '0.6rem', color: '#4a7a50' }}>/100</div>
            </div>
        </div>
    )
}

const DEMO_SNIPPETS = {
    'SQL Injection': `# Python endpoint — vulnerable:
def get_user(email):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    db.execute(query)`,
    'XSS': `<!-- Reflected XSS vulnerability -->
<p>Welcome, {{ user_input }}</p>
<script>document.cookie = document.cookie</script>`,
    'Hardcoded Creds': `# Hardcoded credential found:
db_password = "admin123"
api_key = "sk-live-supersecret"
JWT_SECRET = "hardcoded_secret"`,
    'JWT None Alg': `// JWT verification bypass:
const decoded = jwt.decode(token, { algorithm: 'none' })
const decoded2 = jwt.verify(token, secret, verify=false)`,
    'Clean code': `# Secure parameterized query:
async def get_user(email: str, db: Session):
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()`,
}

export default function ThreatAnalyzerPage() {
    const [input, setInput] = useState('')
    const [result, setResult] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [mode, setMode] = useState('code') // 'code' | 'url' | 'text'
    const [scanLog, setScanLog] = useState([])

    const runScan = useCallback(() => {
        if (!input.trim()) return
        setScanning(true)
        setResult(null)
        setScanLog([])
        const lines = [
            '> Initializing OWASP threat scan engine…',
            '> Pattern database loaded: 10 rules',
            '> Scanning input for injection vectors…',
            '> Checking cryptographic weaknesses…',
            '> Analyzing authentication patterns…',
            '> Cross-referencing OWASP Top 10 (2021)…',
            '> Generating threat report…',
            '> Scan complete.',
        ]
        lines.forEach((line, i) => {
            setTimeout(() => {
                setScanLog(l => [...l, line])
                if (i === lines.length - 1) {
                    setTimeout(() => {
                        setResult(analyze(input))
                        setScanning(false)
                    }, 300)
                }
            }, i * 220)
        })
    }, [input])

    const loadDemo = (name) => {
        setInput(DEMO_SNIPPETS[name])
        setResult(null)
        setScanLog([])
        setMode('code')
    }

    return (
        <div style={{ paddingTop: '85px', minHeight: '100vh', padding: '85px 1.5rem 3rem' }}>
            <div className="cyber-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35 }} />
            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={26} style={{ color: '#ef4444' }} />
                        <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0' }}>
                            Cyber <span style={{ color: '#ef4444' }}>Threat Analyzer</span>
                        </h1>
                    </div>
                    <p style={{ color: '#4a7a50', fontSize: '0.9rem' }}>Paste code, URLs, or text to detect OWASP Top 10 vulnerability patterns instantly.</p>
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                        ⚠ EDUCATIONAL TOOL — For learning & awareness. Not a substitute for a professional security audit.
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left: Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Mode tabs */}
                        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '8px', border: '1px solid rgba(0,255,65,0.08)' }}>
                            {[{ key: 'code', label: '💻 Code', icon: Code }, { key: 'url', label: '🔗 URL', icon: LinkIcon }, { key: 'text', label: '📄 Text', icon: FileText }].map(t => (
                                <button key={t.key} onClick={() => setMode(t.key)}
                                    style={{ flex: 1, padding: '0.4rem', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', background: mode === t.key ? 'rgba(0,255,65,0.12)' : 'transparent', color: mode === t.key ? '#00ff41' : '#4a7a50', transition: 'all 0.2s' }}
                                >{t.label}</button>
                            ))}
                        </div>

                        {/* Input area */}
                        <textarea value={input} onChange={e => setInput(e.target.value)}
                            placeholder={mode === 'url' ? 'https://target.example.com/api/...' : mode === 'code' ? '// Paste code snippet here…\n// The AI scanner will detect security issues.' : 'Paste any text content to analyze for security patterns…'}
                            className="cyber-input"
                            style={{ minHeight: '220px', resize: 'vertical', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}
                        />

                        {/* Demo loaders */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#4a7a50', marginBottom: '0.5rem' }}>Load demo:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {Object.keys(DEMO_SNIPPETS).map(name => (
                                    <button key={name} onClick={() => loadDemo(name)}
                                        style={{ padding: '0.25rem 0.65rem', background: 'rgba(0,180,83,0.1)', border: '1px solid rgba(0,180,83,0.25)', borderRadius: '10px', color: '#a7f3c3', fontSize: '0.7rem', cursor: 'pointer' }}
                                    >{name}</button>
                                ))}
                            </div>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runScan} disabled={scanning || !input.trim()}
                            style={{ padding: '0.9rem', background: scanning ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#ef4444,#00c853)', border: 'none', borderRadius: '8px', color: scanning ? '#ef4444' : '#fff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', letterSpacing: '0.08em' }}
                        >
                            {scanning ? <><RefreshCw size={16} className="spin" /> SCANNING…</> : <><Zap size={16} /> RUN THREAT SCAN</>}
                        </motion.button>
                    </div>

                    {/* Right: Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Scan log terminal */}
                        <AnimatePresence>
                            {(scanning || scanLog.length > 0) && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: '10px', padding: '1rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}
                                >
                                    <div style={{ color: '#4a7a50', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Terminal size={12} /> sys@digitalhq:~$
                                    </div>
                                    {scanLog.map((line, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            style={{ color: line.includes('complete') ? '#10b981' : '#4a7a50', marginBottom: '0.15rem' }}
                                        >{line}</motion.div>
                                    ))}
                                    {scanning && <span style={{ color: '#00ff41' }} className="cursor-blink">_</span>}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results */}
                        <AnimatePresence>
                            {result && (
                                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                    {/* Summary card */}
                                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${LEVEL_CONFIG[result.level]?.border}` }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <ScoreRing score={result.score} level={result.level} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: LEVEL_CONFIG[result.level]?.color, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                    {LEVEL_CONFIG[result.level]?.icon} {result.level.toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>{result.summary}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#4a7a50', marginTop: '0.4rem', fontFamily: 'JetBrains Mono' }}>
                                                    {result.findings.length} pattern{result.findings.length !== 1 ? 's' : ''} found · Threat Score: {result.score}/100
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Findings */}
                                    {result.findings.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {result.findings.map((f, i) => {
                                                const cfg = LEVEL_CONFIG[f.level]
                                                return (
                                                    <motion.div key={f.category} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                        className="glass-card" style={{ padding: '1rem', border: `1px solid ${cfg.border}` }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                            <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                                    <span style={{ fontWeight: 700, color: cfg.color, fontSize: '0.85rem' }}>{f.category}</span>
                                                                    <span style={{ fontSize: '0.6rem', background: `${cfg.color}20`, border: `1px solid ${cfg.border}`, borderRadius: '4px', padding: '0.05rem 0.35rem', color: cfg.color }}>{f.level}</span>
                                                                    <span style={{ fontSize: '0.6rem', color: '#4a7a50', fontFamily: 'JetBrains Mono' }}>{f.owasp}</span>
                                                                </div>
                                                                <div style={{ fontSize: '0.77rem', color: '#94a3b8', lineHeight: 1.6 }}>💡 {f.mitigation}</div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {result.level === 'Clean' && (
                                        <div className="glass-card" style={{ padding: '1.2rem', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '0.2rem' }}>Looks clean!</div>
                                                <div style={{ fontSize: '0.8rem', color: '#4a7a50' }}>No major OWASP vulnerability patterns detected. Always conduct a professional security audit for production systems.</div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!result && !scanning && !scanLog.length && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5, minHeight: '200px' }}>
                                <Shield size={44} style={{ color: '#4a7a50' }} />
                                <p style={{ fontSize: '0.82rem', color: '#4a7a50', textAlign: 'center', lineHeight: 1.7 }}>
                                    Paste code or text into the input box,<br />then click <strong>Run Threat Scan</strong> to begin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
