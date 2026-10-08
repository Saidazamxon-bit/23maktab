import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '../../lib/api'
import { errMsg, Field, ImageField, LoadState, PageHead, useLoad, useUi } from '../ui'

const FIELDS: Array<{ key: string; label: string; hint?: string; placeholder?: string }> = [
  { key: 'phone', label: 'Telefon', placeholder: '+998 71 200 00 00' },
  { key: 'email', label: 'Email', placeholder: 'info@23maktab.uz' },
  { key: 'address', label: 'Manzil' },
  { key: 'bot_username', label: 'Telegram bot username', hint: 'Masalan: maktab23_bot (@ siz). Saytning pastki qismida bot havolasi chiqadi.' },
  { key: 'telegram', label: 'Telegram kanal/havola', placeholder: 'https://t.me/...' },
  { key: 'instagram', label: 'Instagram havolasi', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook havolasi', placeholder: 'https://facebook.com/...' },
  { key: 'youtube', label: 'YouTube havolasi', placeholder: 'https://youtube.com/...' },
]

export function SettingsAdminPage() {
  const { toast } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ settings: Record<string, string> }>('settings').then((r) => r.settings))
  const [vals, setVals] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState({ old: '', next: '', again: '' })
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => { if (data) setVals(data) }, [data])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await adminApi.post('settings', 'save', { settings: vals })
      toast('Sozlamalar saqlandi')
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const changePw = async (e: FormEvent) => {
    e.preventDefault()
    if (pw.next !== pw.again) { toast('Yangi parollar bir xil emas', 'err'); return }
    setPwBusy(true)
    try {
      await adminApi.post('password', '', { old: pw.old, new: pw.next })
      toast('Parol o‘zgartirildi')
      setPw({ old: '', next: '', again: '' })
    } catch (err) { toast(errMsg(err), 'err') } finally { setPwBusy(false) }
  }

  return (
    <>
      <PageHead title="Sozlamalar" desc="Saytning aloqa ma’lumotlari, ijtimoiy tarmoqlar va bosh sahifa rasmi." />
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && (
        <form className="a-card a-form" onSubmit={save}>
          <h2>Sayt ma’lumotlari</h2>
          <div className="a-form-2">
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                <input className="a-input" value={vals[f.key] || ''} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} placeholder={f.placeholder} maxLength={255} />
              </Field>
            ))}
          </div>
          {/* Removed large hero image field per request */}
          <div className="a-modal-actions"><button type="submit" className="a-btn" disabled={busy}>Saqlash</button></div>
        </form>
      )}

      <form className="a-card a-form" onSubmit={changePw}>
        <h2>Parolni o‘zgartirish</h2>
        <div className="a-form-2">
          <Field label="Hozirgi parol"><input className="a-input" type="password" autoComplete="current-password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} required /></Field>
          <span />
          <Field label="Yangi parol" hint="Kamida 8 belgi"><input className="a-input" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={8} /></Field>
          <Field label="Yangi parolni takrorlang"><input className="a-input" type="password" autoComplete="new-password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} required minLength={8} /></Field>
        </div>
        <div className="a-modal-actions"><button type="submit" className="a-btn" disabled={pwBusy}>Parolni yangilash</button></div>
      </form>

      <section className="a-card">
        <h2>Sayt matnlarini tahrirlash</h2>
        <p className="a-muted">Saytning o‘zida: admin sifatida kirgan holda istalgan sahifada pastki o‘ng burchakdagi “Matnlarni tahrirlash” tugmasini bosing, so‘ng matn ustidagi qalamchani bosing. O‘zgarish tanlangan til uchun saqlanadi.</p>
      </section>
    </>
  )
}
