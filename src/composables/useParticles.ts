import { onMounted, onUnmounted } from 'vue'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  life: number; maxLife: number
}

export function useParticles(canvasId: string) {
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let rafId: number
  const particles: Particle[] = []

  function resize() {
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  function spawn(): Particle {
    const w = canvas?.width || 800
    const h = canvas?.height || 600
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      life: 0,
      maxLife: 200 + Math.random() * 300,
    }
  }

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Maintain ~60 particles
    while (particles.length < 60) particles.push(spawn())

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life++
      p.x += p.vx
      p.y += p.vy

      const fade = p.life < 30 ? p.life / 30 : p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30 : 1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity * fade})`
      ctx.fill()

      if (p.life >= p.maxLife) particles.splice(i, 1)
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    rafId = requestAnimationFrame(draw)
  }

  onMounted(() => {
    canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) return
    ctx = canvas.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    draw()
  })

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
  })
}
