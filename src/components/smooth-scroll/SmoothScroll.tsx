import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (lenisRef.current) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotion = mediaQuery.matches

    const lenis = new Lenis({
      duration: reducedMotion ? 0.001 : 1.2,
      smoothWheel: !reducedMotion,
      syncTouch: true,
      wheelMultiplier: reducedMotion ? 0.7 : 0.9,
      touchMultiplier: reducedMotion ? 0.8 : 1,
      lerp: reducedMotion ? 0.04 : 0.08,
      gestureOrientation: 'both',
      autoResize: true,
    })

    lenisRef.current = lenis

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = window.requestAnimationFrame(raf)
    }

    rafId = window.requestAnimationFrame(raf)

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null

      if (!anchor || !anchor.hash) {
        return
      }

      const id = anchor.hash.slice(1)
      const element = document.getElementById(id)

      if (!element) {
        return
      }

      event.preventDefault()

      const navbar = document.querySelector('.navbar')
      const offset = navbar ? navbar.getBoundingClientRect().height + 18 : 0

      lenis.scrollTo(element, {
        offset: -offset,
        duration: reducedMotion ? 0 : 1.1,
      })
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return null
}
