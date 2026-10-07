import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n'

export default function SchoolShowcaseGallery() {
  const { t } = useLanguage()
  const showcaseCards = t.showcase?.cards ?? []
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()

  const [layout, setLayout] = useState({
    cardWidth: 420,
    gap: 28,
    startPadding: 52,
    endPadding: 52,
    maxDistance: 0,
    sectionHeight: 0,
  })

  useEffect(() => {
    const updateLayout = () => {
      const viewportWidth = window.innerWidth
      const cardWidth = Math.min(460, Math.max(270, viewportWidth * 0.45))
      const gap = viewportWidth <= 600 ? 18 : viewportWidth <= 900 ? 22 : 28
      const startPadding = 12
      const endPadding = 12

      const trackWidth = trackRef.current
        ? trackRef.current.scrollWidth
        : showcaseCards.length * cardWidth + (showcaseCards.length - 1) * gap + startPadding + endPadding

      const maxDistance = Math.max(0, trackWidth - viewportWidth)
      const sectionHeight = Math.max(window.innerHeight * 0.54, maxDistance + window.innerHeight * 0.12)

      setLayout({
        cardWidth,
        gap,
        startPadding,
        endPadding,
        maxDistance,
        sectionHeight,
      })
    }

    updateLayout()

    const handleResize = () => updateLayout()
    const resizeObserver = new ResizeObserver(handleResize)

    window.addEventListener('resize', handleResize)
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [showcaseCards.length])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -layout.maxDistance])

  return (
    <section
      ref={sectionRef}
      className="school-showcase-shell"
      style={{ height: `${layout.sectionHeight}px` }}
    >
      <div className="container school-showcase-header">
        <div className="section-label">{t.showcase?.label}</div>
        <div className="split-heading school-showcase-heading">
          <h2>{t.showcase?.headingStart}<em>{t.showcase?.headingHighlight}</em></h2>
          <p>{t.showcase?.description}</p>
        </div>
      </div>

      <div className="school-showcase-sticky">
        <motion.div
          ref={trackRef}
          className="school-showcase-track"
          style={
            reducedMotion
              ? {
                  x: 0,
                  paddingLeft: `${layout.startPadding}px`,
                  paddingRight: `${layout.endPadding}px`,
                }
              : {
                  x,
                  paddingLeft: `${layout.startPadding}px`,
                  paddingRight: `${layout.endPadding}px`,
                }
          }
        >
          {showcaseCards.map((item) => (
            <article
              key={item.id}
              className="school-showcase-card"
              style={{
                width: `${layout.cardWidth}px`,
                backgroundImage: `linear-gradient(180deg, rgba(9, 18, 21, 0.12), rgba(5, 11, 15, 0.72)), url(${item.image})`,
              }}
            >
              <div className="school-showcase-card__content">
                <span className="school-showcase-card__number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
