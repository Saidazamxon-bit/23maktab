import { useMemo } from 'react'
import { useLanguage } from '../i18n'
import { fmtCountdown, toSec, type Now } from '../lib/liveClock'
import type { PublicLesson } from '../lib/types'

/** Tanlangan sinf uchun: hozir qaysi dars, keyingi dars, o'qituvchi, xona va sanoq. */
export function LiveStatus({ lessons, now }: { lessons: PublicLesson[]; now: Now }) {
  const { t } = useLanguage()
  const s = t.schedulePage

  const todaySorted = useMemo(
    () => lessons.filter((l) => l.weekday === now.weekday && l.start && l.end).sort((a, b) => a.lesson_no - b.lesson_no),
    [lessons, now.weekday],
  )
  const current = todaySorted.find((l) => toSec(l.start) <= now.seconds && now.seconds < toSec(l.end)) || null
  const next = todaySorted.find((l) => toSec(l.start) > now.seconds) || null

  let note = ''
  if (now.weekday === 7) note = s.liveSunday
  else if (todaySorted.length === 0) note = s.liveNoToday
  else if (!current && !next) note = s.liveDone
  else if (!current) note = now.seconds < toSec(todaySorted[0].start) ? s.liveBefore : s.liveBrk

  const progress = current ? Math.min(100, Math.max(0, ((now.seconds - toSec(current.start)) / (toSec(current.end) - toSec(current.start))) * 100)) : 0

  return (
    <section className="live-panel" aria-live="polite" aria-label={s.liveLive}>
      <div className={`glass-card live-card ${current ? 'is-now' : ''}`}>
        <div className="live-head">
          <span className="live-badge"><i aria-hidden="true" /> {s.liveLive}</span>
          <span className="live-label">{s.liveNowL}</span>
        </div>
        {current ? (
          <>
            <h3>{current.lesson_no}. {current.subject}</h3>
            <p className="live-meta">
              {current.start}–{current.end}
              {current.room ? ` · ${s.room}: ${current.room}` : ''}
            </p>
            {current.teacher && <p className="live-teacher">{s.teacher}: <b>{current.teacher}</b></p>}
            <div className="live-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="live-count">{s.liveEndsIn}: <b>{fmtCountdown(toSec(current.end) - now.seconds)}</b></p>
          </>
        ) : (
          <p className="live-note">{note}</p>
        )}
      </div>

      <div className="glass-card live-card">
        <div className="live-head"><span className="live-label">{s.liveNextL}</span></div>
        {next ? (
          <>
            <h3>{next.lesson_no}. {next.subject}</h3>
            <p className="live-meta">
              {next.start}–{next.end}
              {next.room ? ` · ${s.room}: ${next.room}` : ''}
            </p>
            {next.teacher && <p className="live-teacher">{s.teacher}: <b>{next.teacher}</b></p>}
            <p className="live-count">{s.liveStartsIn}: <b>{fmtCountdown(toSec(next.start) - now.seconds)}</b></p>
          </>
        ) : (
          <p className="live-note">{s.liveNoNext}</p>
        )}
      </div>
    </section>
  )
}
