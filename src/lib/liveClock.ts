import { useEffect, useRef, useState } from 'react'

export interface ServerClock { weekday: number; seconds: number }
export interface Now { weekday: number; seconds: number }

/** Toshkent vaqti (qurilma soati noto'g'ri bo'lsa ham server soatidan foydalanamiz). */
function tashkentNow(): Now {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tashkent', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1
  return { weekday: wd || 1, seconds: Number(get('hour')) * 3600 + Number(get('minute')) * 60 + Number(get('second')) }
}

/** Har soniyada yangilanadigan hozirgi vaqt. `server` — API qaytargan vaqt (bo'lsa, shunga tayanadi). */
export function useLiveNow(server: ServerClock | null): Now {
  const base = useRef<{ clock: ServerClock; at: number } | null>(null)
  const [now, setNow] = useState<Now>(() => tashkentNow())

  useEffect(() => {
    base.current = server ? { clock: server, at: performance.now() } : null
  }, [server])

  useEffect(() => {
    const tick = () => {
      const b = base.current
      if (!b) { setNow(tashkentNow()); return }
      const total = b.clock.seconds + Math.floor((performance.now() - b.at) / 1000)
      const dayShift = Math.floor(total / 86400)
      setNow({ weekday: ((b.clock.weekday - 1 + dayShift) % 7) + 1, seconds: total % 86400 })
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return now
}

export function toSec(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 3600 + (m || 0) * 60
}

export function fmtCountdown(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const mm = String(m).padStart(2, '0')
  const sss = String(ss).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${sss}` : `${mm}:${sss}`
}
