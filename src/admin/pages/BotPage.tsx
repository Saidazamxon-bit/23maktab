import { useState, type FormEvent } from 'react'
import { Bot, CheckCircle2, Megaphone, Plug, XCircle } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { AClass, BotStatus, BotUser } from '../types'
import { errMsg, LoadState, PageHead, useLoad, useUi } from '../ui'

export function BotPage() {
  const { toast } = useUi()
  const { data, loading, error, reload } = useLoad(async () => {
    const [status, users, classes] = await Promise.all([
      adminApi.get<BotStatus>('bot'),
      adminApi.get<{ users: BotUser[] }>('bot', { view: 'users' }),
      adminApi.get<{ classes: AClass[] }>('classes'),
    ])
    return { status, users: users.users, classes: classes.classes }
  })
  const [connecting, setConnecting] = useState(false)
  const [text, setText] = useState('')
  const [audience, setAudience] = useState('all')
  const [classId, setClassId] = useState('')
  const [progress, setProgress] = useState('')
  const [sending, setSending] = useState(false)

  const connect = async () => {
    setConnecting(true)
    try {
      const r = await adminApi.post<{ ok: boolean; description: string }>('bot', 'webhook')
      if (r.ok) toast('Bot ulandi')
      else toast(r.description || 'Ulab bo‘lmadi', 'err')
      await reload()
    } catch (e) { toast(errMsg(e), 'err') } finally { setConnecting(false) }
  }

  const broadcast = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    let after = 0, sent = 0, failed = 0, total = 0
    try {
      // Server 25 tadan yuboradi; tugaguncha takrorlaymiz
      for (let guard = 0; guard < 400; guard++) {
        const r = await adminApi.post<{ sent: number; failed: number; next_after: number; done: boolean; total: number }>(
          'bot', 'broadcast', { text, audience, class_id: audience === 'class' ? Number(classId) : 0, after },
        )
        sent += r.sent; failed += r.failed; total = r.total; after = r.next_after
        setProgress(`Yuborilmoqda: ${sent + failed} / ${total}`)
        if (r.done) break
      }
      toast(`Yuborildi: ${sent} ta${failed ? `, xatolik: ${failed} ta` : ''}`, failed ? 'err' : 'ok')
      setText('')
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setSending(false); setProgress('') }
  }

  const s = data?.status

  return (
    <>
      <PageHead title="Telegram bot" desc="Botning holati, foydalanuvchilar va e’lon yuborish. Dars jadvali, o‘qituvchilar va sinflar shu panelning o‘zidan boshqariladi." />
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && s && (
        <>
          <section className="a-card">
            <div className="a-bot-head">
              <span className="a-stat-icon"><Bot size={22} /></span>
              <div>
                <h2>{s.bot ? `@${s.bot.username}` : 'Bot topilmadi'}</h2>
                {s.bot_error && <p className="a-error-text">{s.bot_error}. config.php dagi BOT_TOKEN ni tekshiring.</p>}
              </div>
              {s.bot && (
                <a className="a-btn ghost sm" href={`https://t.me/${s.bot.username}`} target="_blank" rel="noreferrer noopener">Telegramda ochish</a>
              )}
            </div>
            <div className="a-status-row">
              {s.webhook.connected
                ? <span className="a-badge ok"><CheckCircle2 size={14} /> Ulangan</span>
                : <span className="a-badge bad"><XCircle size={14} /> Ulanmagan</span>}
              {s.webhook.pending > 0 && <span className="a-badge">{s.webhook.pending} ta kutayotgan xabar</span>}
              <button type="button" className="a-btn sm" onClick={() => void connect()} disabled={connecting}>
                <Plug size={14} /> {s.webhook.connected ? 'Qayta ulash' : 'Botni ulash'}
              </button>
            </div>
            {s.webhook.last_error && <p className="a-error-text">Telegram xatosi: {s.webhook.last_error}</p>}
            {!s.webhook.connected && s.webhook.url && <p className="a-muted">Hozirgi manzil: {s.webhook.url}</p>}
          </section>

          <div className="a-stats small">
            <div className="a-stat"><b>{s.users.total}</b><span className="a-stat-label">Foydalanuvchilar</span></div>
            <div className="a-stat"><b>{s.users.students}</b><span className="a-stat-label">O‘quvchilar</span></div>
            <div className="a-stat"><b>{s.users.teachers}</b><span className="a-stat-label">O‘qituvchilar</span></div>
            <div className="a-stat"><b>{s.users.notify}</b><span className="a-stat-label">Eslatma yoqqan</span></div>
            <div className="a-stat"><b>{s.users.blocked}</b><span className="a-stat-label">Botni bloklagan</span></div>
          </div>

          <form className="a-card a-form" onSubmit={broadcast}>
            <h2><Megaphone size={18} /> E’lon yuborish</h2>
            <div className="a-form-2">
              <label className="a-field">
                <span className="a-label">Kimlarga</span>
                <select className="a-input" value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option value="all">Hammaga</option>
                  <option value="students">Faqat o‘quvchilarga</option>
                  <option value="teachers">Faqat o‘qituvchilarga</option>
                  <option value="class">Bitta sinfga</option>
                </select>
              </label>
              {audience === 'class' && (
                <label className="a-field">
                  <span className="a-label">Sinf</span>
                  <select className="a-input" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                    <option value="">— tanlang —</option>
                    {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
            </div>
            <label className="a-field">
              <span className="a-label">Xabar matni</span>
              <textarea className="a-input" rows={5} value={text} onChange={(e) => setText(e.target.value)} maxLength={3000} required />
              <span className="a-hint">{text.length} / 3000</span>
            </label>
            <div className="a-row">
              <button type="submit" className="a-btn" disabled={sending || !text.trim()}>Yuborish</button>
              {progress && <span className="a-muted">{progress}</span>}
            </div>
          </form>

          <section className="a-card">
            <h2>Foydalanuvchilar</h2>
            {data.users.length === 0 ? <p className="a-muted">Hozircha hech kim ro‘yxatdan o‘tmagan.</p> : (
              <div className="a-scroll">
                <table className="a-table">
                  <thead><tr><th scope="col">Ism</th><th scope="col">Rol</th><th scope="col">Sinf / o‘qituvchi</th><th scope="col">Eslatma</th><th scope="col">Oxirgi faollik</th></tr></thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.telegram_id}>
                        <td>{u.first_name || '—'}{u.blocked && <span className="a-badge bad">bloklagan</span>}</td>
                        <td>{u.role === 'teacher' ? 'O‘qituvchi' : 'O‘quvchi'}</td>
                        <td>{u.who || '—'}</td>
                        <td>{u.notify ? 'Yoqilgan' : '—'}</td>
                        <td>{u.last_seen || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
