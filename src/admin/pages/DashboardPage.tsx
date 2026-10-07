import { Link } from 'react-router-dom'
import { Bot, CalendarDays, Image as ImageIcon, Newspaper, School, Users } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { AActivity, AStats, BotStatus } from '../types'
import { LoadState, PageHead, useLoad } from '../ui'

export function DashboardPage() {
  const { data, loading, error, reload } = useLoad(async () => {
    const [stats, act] = await Promise.all([
      adminApi.get<AStats>('stats'),
      adminApi.get<{ activity: AActivity[] }>('activity', { limit: 8 }),
    ])
    let bot: BotStatus | null = null
    try { bot = await adminApi.get<BotStatus>('bot') } catch { /* bot holati ixtiyoriy */ }
    return { stats, activity: act.activity, bot }
  })

  const s = data?.stats
  const cards = s ? [
    { label: 'O‘qituvchilar', value: s.teachers, sub: `${s.bound_teachers} tasi botga ulangan`, icon: Users, to: '/admin/teachers' },
    { label: 'Sinflar', value: s.classes, sub: `${s.students} o‘quvchi botda`, icon: School, to: '/admin/classes' },
    { label: 'Darslar', value: s.lessons, sub: `${s.bells} ta qo‘ng‘iroq vaqti`, icon: CalendarDays, to: '/admin/schedule' },
    { label: 'Bot foydalanuvchilari', value: s.bot_users, sub: 'ro‘yxatdan o‘tganlar', icon: Bot, to: '/admin/bot' },
    { label: 'Yangiliklar', value: s.news, sub: 'saytda', icon: Newspaper, to: '/admin/news' },
    { label: 'Galereya', value: s.gallery, sub: 'rasm', icon: ImageIcon, to: '/admin/gallery' },
  ] : []

  const checklist = s ? [
    { ok: s.classes > 0, text: 'Sinflarni qo‘shing', to: '/admin/classes' },
    { ok: s.bells > 0, text: 'Qo‘ng‘iroq vaqtlarini tekshiring', to: '/admin/bells' },
    { ok: s.teachers > 0, text: 'O‘qituvchilarni qo‘shing', to: '/admin/teachers' },
    { ok: s.lessons > 0, text: 'Dars jadvalini to‘ldiring', to: '/admin/schedule' },
    { ok: !!data?.bot?.webhook.connected, text: 'Telegram botni ulang', to: '/admin/bot' },
  ] : []

  return (
    <>
      <PageHead title="Boshqaruv paneli" desc="Sayt va Telegram bot bir xil ma’lumotdan foydalanadi: bu yerda o‘zgartirsangiz, ikkalasida ham yangilanadi." />
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && (
        <>
          <div className="a-stats">
            {cards.map(({ label, value, sub, icon: Icon, to }) => (
              <Link to={to} key={label} className="a-stat">
                <span className="a-stat-icon"><Icon size={20} /></span>
                <b>{value}</b>
                <span className="a-stat-label">{label}</span>
                <small>{sub}</small>
              </Link>
            ))}
          </div>

          <div className="a-grid-2">
            <section className="a-card">
              <h2>Ishga tushirish</h2>
              <ul className="a-checklist">
                {checklist.map((c) => (
                  <li key={c.text} className={c.ok ? 'done' : ''}>
                    <span className="a-check" aria-hidden="true">{c.ok ? '✓' : ''}</span>
                    <Link to={c.to}>{c.text}</Link>
                    <span className="a-sr">{c.ok ? ' — bajarilgan' : ' — bajarilmagan'}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="a-card">
              <h2>So‘nggi amallar</h2>
              {data.activity.length === 0 ? (
                <p className="a-muted">Hozircha amallar yo‘q.</p>
              ) : (
                <ul className="a-feed">
                  {data.activity.map((a) => (
                    <li key={a.id}>
                      <b>{a.admin_name}</b> · {a.entity}{a.details ? ` — ${a.details}` : ''}
                      <small>{a.created_at}</small>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/activity" className="a-link">Barchasini ko‘rish →</Link>
            </section>
          </div>
        </>
      )}
    </>
  )
}
