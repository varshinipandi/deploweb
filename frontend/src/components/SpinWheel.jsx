import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SEGMENTS = [
    { label: '50 pts', value: 50, color: '#00ff41', textColor: '#020d04' },
    { label: 'Try Again', value: 0, color: '#1a3a24', textColor: '#3a6b45' },
    { label: '200 pts', value: 200, color: '#00d4ff', textColor: '#020d04' },
    { label: '25 pts', value: 25, color: '#0d4a20', textColor: '#00ff41' },
    { label: '🎉 500 pts', value: 500, color: '#f59e0b', textColor: '#020d04' },
    { label: '100 pts', value: 100, color: '#00ff41', textColor: '#020d04' },
    { label: '75 pts', value: 75, color: '#00d4ff', textColor: '#020d04' },
    { label: 'Try Again', value: 0, color: '#1a2a3a', textColor: '#3a6b45' },
]
const N = SEGMENTS.length
const SLICEDEG = 360 / N

function getLastSpunDate() { return localStorage.getItem('hq_spin_date') }
function setSpunToday() { localStorage.setItem('hq_spin_date', new Date().toDateString()) }
function hasSpunToday() { return getLastSpunDate() === new Date().toDateString() }

export default function SpinWheel({ onWin }) {
    const [spinning, setSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [result, setResult] = useState(null)
    const [spunToday, setSpunTodayState] = useState(hasSpunToday)
    const canvasRef = useRef(null)

    const drawWheel = (rot) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 6
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        SEGMENTS.forEach((seg, i) => {
            const start = (i * SLICEDEG - 90 + rot) * Math.PI / 180
            const end = ((i + 1) * SLICEDEG - 90 + rot) * Math.PI / 180
            ctx.beginPath(); ctx.moveTo(cx, cy)
            ctx.arc(cx, cy, r, start, end)
            ctx.closePath()
            ctx.fillStyle = seg.color; ctx.fill()
            ctx.strokeStyle = '#020d04'; ctx.lineWidth = 2; ctx.stroke()
            ctx.save(); ctx.translate(cx, cy)
            ctx.rotate((start + end) / 2)
            ctx.textAlign = 'right'
            ctx.fillStyle = seg.textColor
            ctx.font = 'bold 11px JetBrains Mono'
            ctx.fillText(seg.label, r - 10, 4)
            ctx.restore()
        })
        // Center dot
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2)
        ctx.fillStyle = '#020d04'; ctx.fill()
        ctx.strokeStyle = '#00ff41'; ctx.lineWidth = 2; ctx.stroke()
    }

    const spin = () => {
        if (spinning || spunToday) return
        setResult(null)
        const randExtra = Math.floor(Math.random() * 360) + 720 + 1440 // 4-6 full rotations
        const targetRot = rotation + randExtra
        const duration = 4000
        const start = performance.now()
        const from = rotation

        const animate = (now) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 4)
            const cur = from + (targetRot - from) * eased
            drawWheel(cur % 360)
            if (t < 1) requestAnimationFrame(animate)
            else {
                setRotation(targetRot % 360)
                setSpinning(false)
                // Determine winner: the segment at top (270 degrees adjusted)
                const finalRot = targetRot % 360
                const adjusted = (360 - finalRot + 270) % 360
                const idx = Math.floor(adjusted / SLICEDEG) % N
                const winner = SEGMENTS[idx]
                setResult(winner)
                if (winner.value > 0) onWin?.(winner.value)
                setSpunToday(true); setSpunTodayState(true)
            }
        }
        setSpinning(true)
        drawWheel(rotation)
        requestAnimationFrame(animate)
    }

    // Draw on mount
    const initRef = (el) => {
        canvasRef.current = el
        if (el) drawWheel(rotation)
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 700, background: 'linear-gradient(135deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Daily XP Spin</span>
                {spunToday && <span style={{ fontSize: '0.62rem', color: '#3a6b45', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,116,139,0.1)', borderRadius: '4px', padding: '0.05rem 0.35rem', fontFamily: 'JetBrains Mono' }}>Come back tomorrow</span>}
            </div>

            {/* Pointer */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '18px solid #00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.8))', zIndex: 10 }} />
                <canvas ref={initRef} width={220} height={220} style={{ display: 'block', borderRadius: '50%', boxShadow: '0 0 30px rgba(0,255,65,0.15), 0 0 60px rgba(0,212,255,0.08)' }} />
            </div>

            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,255,65,0.35),0 0 50px rgba(0,212,255,0.15)' }} whileTap={{ scale: 0.95 }}
                onClick={spin} disabled={spinning || spunToday}
                style={{ marginTop: '1rem', padding: '0.65rem 2rem', background: spinning || spunToday ? 'rgba(0,0,0,0.3)' : 'linear-gradient(135deg,#00ff41,#00d4ff)', border: spinning || spunToday ? '1px solid rgba(100,116,139,0.15)' : 'none', borderRadius: '8px', color: spinning || spunToday ? '#3a6b45' : '#020d04', fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.82rem', cursor: spinning || spunToday ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}>
                {spinning ? '⟳ SPINNING…' : spunToday ? '✓ DONE FOR TODAY' : '⚡ SPIN NOW'}
            </motion.button>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ marginTop: '0.85rem', padding: '0.65rem 1rem', background: result.value > 0 ? 'rgba(0,255,65,0.08)' : 'rgba(0,0,0,0.2)', border: result.value > 0 ? '1px solid rgba(0,255,65,0.25)' : '1px solid rgba(100,116,139,0.1)', borderRadius: '8px' }}>
                        <div style={{ fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 900, color: result.value >= 500 ? '#f59e0b' : result.value > 0 ? '#00ff41' : '#3a6b45' }}>
                            {result.value > 0 ? `+${result.value} XP Earned!` : 'Better luck tomorrow!'}
                        </div>
                        {result.value >= 500 && <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>🎉 JACKPOT!</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
