import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Award } from 'lucide-react'

export default function CertificateGenerator({ eventName, participantName, eventDate }) {
    const canvasRef = useRef(null)
    const [generated, setGenerated] = useState(false)

    const generate = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width, H = canvas.height

        // Background
        ctx.fillStyle = '#020d04'
        ctx.fillRect(0, 0, W, H)

        // Outer border glow
        ctx.strokeStyle = '#00ff41'
        ctx.lineWidth = 3
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 20
        ctx.strokeRect(15, 15, W - 30, H - 30)
        ctx.shadowBlur = 0

        // Inner border — blue
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = 1
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 8
        ctx.strokeRect(25, 25, W - 50, H - 50)
        ctx.shadowBlur = 0

        // Corner decorations
        const corners = [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]]
        corners.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fillStyle = '#f59e0b'; ctx.fill()
        })

        // CyberAI HQ header
        ctx.textAlign = 'center'
        ctx.fillStyle = '#64748b'
        ctx.font = '13px JetBrains Mono'
        ctx.fillText('CYBERAI HQ', W / 2, 65)

        // Title
        const gradient = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0)
        gradient.addColorStop(0, '#00ff41')
        gradient.addColorStop(1, '#00d4ff')
        ctx.fillStyle = gradient
        ctx.font = 'bold 28px Orbitron, monospace'
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 15
        ctx.fillText('CERTIFICATE', W / 2, 115)
        ctx.shadowBlur = 0
        ctx.font = '13px JetBrains Mono'
        ctx.fillStyle = '#64748b'
        ctx.fillText('OF  PARTICIPATION', W / 2, 138)

        // Divider line
        ctx.beginPath()
        ctx.moveTo(80, 155); ctx.lineTo(W - 80, 155)
        const lineGrad = ctx.createLinearGradient(80, 0, W - 80, 0)
        lineGrad.addColorStop(0, 'transparent')
        lineGrad.addColorStop(0.3, '#00ff41')
        lineGrad.addColorStop(0.7, '#00d4ff')
        lineGrad.addColorStop(1, 'transparent')
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1.5; ctx.stroke()

        // This certifies that
        ctx.font = '11px JetBrains Mono'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('This certifies that', W / 2, 190)

        // Name
        ctx.font = 'bold 26px Orbitron, monospace'
        ctx.fillStyle = '#e8f5e9'
        ctx.shadowColor = 'rgba(0,255,65,0.4)'
        ctx.shadowBlur = 10
        ctx.fillText(participantName || 'Community Member', W / 2, 230)
        ctx.shadowBlur = 0

        // Has successfully participated in
        ctx.font = '11px JetBrains Mono'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('has successfully participated in', W / 2, 262)

        // Event name — blue
        ctx.font = 'bold 18px Orbitron, monospace'
        ctx.fillStyle = '#00d4ff'
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 10
        ctx.fillText(eventName || 'CyberAI HQ Event', W / 2, 295)
        ctx.shadowBlur = 0

        // Date
        ctx.font = '11px JetBrains Mono'
        ctx.fillStyle = '#64748b'
        ctx.fillText(eventDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, 320)

        // Bottom divider
        ctx.beginPath()
        ctx.moveTo(80, 340); ctx.lineTo(W - 80, 340)
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1; ctx.stroke()

        // Shield icon text
        ctx.font = '22px serif'
        ctx.fillText('🛡️', W / 2, 370)

        // Issued by
        ctx.font = '10px JetBrains Mono'
        ctx.fillStyle = '#64748b'
        ctx.fillText('Issued by CyberAI HQ · Build. Hack. Secure. Lead.', W / 2, 395)

        // Watermark grid dots
        ctx.fillStyle = 'rgba(0,255,65,0.04)'
        for (let x = 40; x < W; x += 20) for (let y = 40; y < H; y += 20) {
            ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
        }

        setGenerated(true)
    }

    const download = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const a = document.createElement('a')
        a.download = `certificate-${(participantName || 'participant').replace(/\s+/g, '-').toLowerCase()}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <Award size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>Certificate of Participation</span>
            </div>

            <canvas ref={canvasRef} width={580} height={420}
                style={{ display: 'block', maxWidth: '100%', borderRadius: '8px', border: '1px solid rgba(0,255,65,0.12)', marginBottom: '0.75rem', background: '#020d04' }} />

            <div style={{ display: 'flex', gap: '0.6rem' }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={generate}
                    style={{ flex: 1, padding: '0.6rem', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: '7px', color: '#00ff41', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer' }}>
                    ⚙ Generate
                </motion.button>
                {generated && (
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(0,212,255,0.2)' }} whileTap={{ scale: 0.96 }} onClick={download}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px', color: '#00d4ff', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <Download size={12} /> Download PNG
                    </motion.button>
                )}
            </div>
        </div>
    )
}
