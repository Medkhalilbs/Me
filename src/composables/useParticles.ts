import { onMounted, onUnmounted } from 'vue'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  life: number; maxLife: number
  color: string
}

export function useParticles(canvasId: string) {
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let rafId: number
  const particles: Particle[] = []

  let targetOffsetX = 0
  let targetOffsetY = 0
  let currentOffsetX = 0
  let currentOffsetY = 0

  function resize() {
    if (!canvas) return
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    } else {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }

  function spawn(): Particle {
    const w = canvas?.width || 800
    const h = canvas?.height || 600
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.45 + 0.1,
      life: 0,
      maxLife: 280 + Math.random() * 280,
      color: 'navy'
    }
  }

  function onMouseMove(e: MouseEvent) {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    // Subtle 10px parallax
    targetOffsetX = (e.clientX - cx) * 0.035
    targetOffsetY = (e.clientY - cy) * 0.035
  }

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Smooth parallax easing
    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.07
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.07

    // Maintain 70 particles (60 navy + ~10 bronze)
    while (particles.length < 70) particles.push(spawn())

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life++
      p.x += p.vx
      p.y += p.vy

      // Wrap edges
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      const fade = p.life < 40 ? p.life / 40 : p.life > p.maxLife - 40 ? (p.maxLife - p.life) / 40 : 1
      const renderX = p.x + currentOffsetX
      const renderY = p.y + currentOffsetY

      ctx.beginPath()
      ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2)

      ctx.fillStyle = `rgba(74, 125, 191, ${p.opacity * fade})`

      ctx.fill()
      if (p.life >= p.maxLife) particles.splice(i, 1)
    }

    // Low-opacity connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) {
          const renderXi = particles[i].x + currentOffsetX
          const renderYi = particles[i].y + currentOffsetY
          const renderXj = particles[j].x + currentOffsetX
          const renderYj = particles[j].y + currentOffsetY

          ctx.beginPath()
          ctx.moveTo(renderXi, renderYi)
          ctx.lineTo(renderXj, renderYj)
          // Very low opacity connections — restrained
          ctx.strokeStyle = `rgba(74, 125, 191, ${0.07 * (1 - dist / 110)})`
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
    window.addEventListener('mousemove', onMouseMove)
    setTimeout(() => {
      resize()
      particles.length = 0
    }, 200)
    draw()
  })

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMouseMove)
  })
}
