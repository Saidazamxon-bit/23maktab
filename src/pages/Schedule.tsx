import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { useLanguage } from '../i18n'
import { publicApi } from '../lib/api'
import { LiveStatus } from '../components/LiveStatus'
import { toSec, useLiveNow, type ServerClock } from '../lib/liveClock'
import type { PublicClass, PublicLesson } from '../lib/types'

const CLASS_KEY = 'school_portal_class'

export function SchedulePage() {
  const { t } = useLanguage()
  const [classes, setClasses] = useState<PublicClass[] | null>(null)
  const [selectedId, setSelectedId] = useState<number>(0)
  const [lessons, setLessons] = useState<PublicLesson[] | null>(null)
  const [error, setError] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [serverClock, setServerClock] = useState<ServerClock | null>(null)
  const [reloadTick, setReloadTick] = useState(0)
  const now = useLiveNow(serverClock)

  const loadClasses = useCallback(async () => {
    setError(false)
    try {
      const r = await publicApi.get<{ classes: PublicClass[] }>('classes')
      setClasses(r.classes)
      let saved = 0
      try { saved = Number(localStorage.getItem(CLASS_KEY)) || 0 } catch { /* ignore */ }
      setSelectedId((cur) => {
        if (cur && r.classes.some((c) => c.id === cur)) return cur
        if (saved && r.classes.some((c) => c.id === saved)) return saved
        return r.classes[0]?.id ?? 0
      })
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => { void loadClasses() }, [loadClasses])

  useEffect(() => {
    if (!selectedId) { setLessons(null); return }
    let alive = true
    setLoadingLessons(true)
    setError(false)
    publicApi
      .get<{ lessons: PublicLesson[]; now?: ServerClock }>('schedule', { class_id: selectedId })
      .then((r) => { if (alive) { setLessons(r.lessons); if (r.now) setServerClock(r.now) } })
      .catch(() => { if (alive) setError(true) })
      .finally(() => { if (alive) setLoadingLessons(false) })
    return () => { alive = false }
  }, [selectedId, reloadTick])

  // Admin jadvalni o'zgartirsa — 5 daqiqada bir va sahifaga qaytganda yangilanadi
  useEffect(() => {
    const id = window.setInterval(() => setReloadTick((n) => n + 1), 5 * 60 * 1000)
    const onVis = () => { if (document.visibilityState === 'visible') setReloadTick((n) => n + 1) }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const onSelect = (id: number) => {
    setSelectedId(id)
    try { localStorage.setItem(CLASS_KEY, String(id)) } catch { /* ignore */ }
  }

  const byDay = useMemo(() => {
    const map = new Map<number, PublicLesson[]>()
    ;(lessons || []).forEach((l) => {
      const arr = map.get(l.weekday) || []
      arr.push(l)
      map.set(l.weekday, arr)
    })
    return map
  }, [lessons])

  const today = now.weekday
  const currentNo = (lessons || []).find((l) => l.weekday === now.weekday && l.start && toSec(l.start) <= now.seconds && now.seconds < toSec(l.end))?.lesson_no
  const nextNo = (lessons || []).filter((l) => l.weekday === now.weekday && l.start && toSec(l.start) > now.seconds).sort((a, b) => a.lesson_no - b.lesson_no)[0]?.lesson_no
  const hasAny = (lessons || []).length > 0

  return (
    <>
      <PageHero eyebrow={t.schedulePage.eyebrow} title={t.schedulePage.title} subtitle={t.schedulePage.subtitle} />

      <main className="page-main">
        <section className="section compact-section">
          <div className="container">
            {error && (
              <div className="empty-state glass-panel" role="alert">
                <p>{t.schedulePage.loadError}</p>
                <button type="button" className="primary-btn" onClick={() => void loadClasses()}>
                  {t.schedulePage.retry}
                </button>
              </div>
            )}

            {!error && classes === null && <div className="empty-state glass-panel">{t.schedulePage.loading}</div>}

            {!error && classes !== null && classes.length === 0 && (
              <div className="empty-state glass-panel">{t.schedulePage.noClasses}</div>
            )}

            {!error && classes !== null && classes.length > 0 && (
              <>
                <div className="toolbar glass-panel schedule-toolbar">
                  <label className="class-select-wrap">
                    <span>{t.schedulePage.chooseClassLabel}</span>
                    <select value={selectedId} onChange={(event) => onSelect(Number(event.target.value))}>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {loadingLessons && !lessons && <div className="empty-state glass-panel">{t.schedulePage.loading}</div>}

                {!loadingLessons && lessons && !hasAny && (
                  <div className="empty-state glass-panel">{t.schedulePage.noLessons}</div>
                )}

                {lessons && <LiveStatus lessons={lessons} now={now} />}

                {hasAny && (
                  <div className="schedule-grid">
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                      const dayLessons = byDay.get(day) || []
                      return (
                        <div className={`glass-card schedule-card ${day === today ? 'today' : ''}`} key={day}>
                          <h3>{t.schedulePage.days[day - 1]}</h3>
                          {dayLessons.length === 0 ? (
                            <p className="schedule-free">{t.schedulePage.freeDay}</p>
                          ) : (
                            <div className="schedule-table">
                              <div className="schedule-head">
                                <span>{t.schedulePage.time}</span>
                                <span>{t.schedulePage.subject}</span>
                                <span>{t.schedulePage.teacher}</span>
                                <span>{t.schedulePage.room}</span>
                              </div>
                              {dayLessons.map((l) => (
                                <div
                                  className={`schedule-row ${day === today && l.lesson_no === currentNo ? 'now' : ''} ${day === today && l.lesson_no === nextNo ? 'next' : ''}`}
                                  key={`${day}-${l.lesson_no}`}
                                >
                                  <span>
                                    <b className="lesson-no">{l.lesson_no}</b>
                                    {l.start && l.end ? `${l.start}–${l.end}` : ''}
                                  </span>
                                  <span>{l.subject}</span>
                                  <span>{l.teacher || '—'}</span>
                                  <span>{l.room || '—'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
