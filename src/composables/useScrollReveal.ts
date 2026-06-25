import { onMounted, onUnmounted, nextTick } from 'vue'

export function useScrollReveal() {
  let observer: IntersectionObserver | null = null

  const initObserver = async () => {
    await nextTick()
    
    const elements = document.querySelectorAll('.reveal')
    if (elements.length === 0) return

    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    elements.forEach((el) => {
      observer?.observe(el)
    })
  }

  onMounted(async () => {
    await nextTick()
    // Petit délai pour s'assurer que tous les composants enfants sont rendus
    setTimeout(initObserver, 100)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  // Permet de réinitialiser après un changement de données
  return { initObserver }
}
