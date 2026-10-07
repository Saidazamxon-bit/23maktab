import { useMemo, useState, type FormEvent } from 'react'
import { Copy, Eye, EyeOff, KeyRound, Link2Off, ListPlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { initials } from '../../lib/format'
import type { ATeacher } from '../types'
import { Empty, errMsg, Field, ImageField, LoadState, Modal, PageHead, useLoad, useUi } from '../ui'

interface Form {
  id: number
  full_name: string
  subject: string
  position: string
  experience: string
  bio: string
  photo: string
  show_on_site: boolean
  sort_order: number
}

const blank: Form = { id: 0, full_name: '', subject: '', position: '', experience: '', bio: '', photo: '', show_on_site: true, sort_order: 0 }

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function TeachersAdminPage() {
  const { toast, confirm } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ teachers: ATeacher[] }>('teachers').then((r) => r.teachers))
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Form | null>(null)
  const [bulk, setBulk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data || []).filter((t) => !q || `${t.full_name} ${t.subject} ${t.position}`.toLowerCase().includes(q))
  }, [data, query])

  const edit = (t: ATeacher) => setForm({
    id: t.id, full_name: t.full_name, subject: t.subject, position: t.position, experience: t.experience,
    bio: t.bio, photo: t.photo, show_on_site: t.show_on_site, sort_order: t.sort_order,
  })

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    setBusy(true)
    try {
      const r = await adminApi.post<{ id: number; code?: string }>('teachers', 'save', { ...form })
      toast(form.id ? 'Saqlandi' : `O‘qituvchi qo‘shildi. Bot kodi: ${r.code}`)
      setForm(null)
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const saveBulk = async (e: FormEvent) => {
    e.preventDefault()
    if (bulk === null) return
    const names = bulk.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!names.length) { toast('Kamida bitta ism yozing', 'err'); return }
    setBusy(true)
    try {
      const r = await adminApi.post<{ created: unknown[]; skipped: string[] }>('teachers', 'create', { names })
      toast(`${r.created.length} ta qo‘shildi${r.skipped.length ? `, o‘tkazib yuborildi: ${r.skipped.join('; ')}` : ''}`, r.skipped.length ? 'err' : 'ok')
      setBulk(null)
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); toast(ok); await reload() } catch (err) { toast(errMsg(err), 'err') }
  }

  const remove = async (t: ATeacher) => {
    const warn = t.lessons ? ` Uning ${t.lessons} ta darsi jadvalda o‘qituvchisiz qoladi.` : ''
    if (await confirm(`${t.full_name}ni o‘chirasizmi?${warn}`)) {
      await act(() => adminApi.post('teachers', 'delete', { id: t.id }), 'O‘chirildi')
    }
  }

  const regen = async (t: ATeacher) => {
    const msg = t.bound ? 'Yangi kod berilsa, o‘qituvchi botdan uziladi va yangi kod bilan qayta kirishi kerak. Davom etamizmi?' : 'Yangi kod beramizmi?'
    if (await confirm(msg, false)) await act(() => adminApi.post('teachers', 'regen', { id: t.id }), 'Yangi kod berildi')
  }

  const unbind = async (t: ATeacher) => {
    if (await confirm(`${t.full_name} Telegram hisobidan uzilsinmi? U kod bilan qayta kira oladi.`, false)) {
      await act(() => adminApi.post('teachers', 'unbind', { id: t.id }), 'Uzildi')
    }
  }

  const copy = async (code: string) => toast((await copyText(code)) ? 'Kod nusxalandi' : 'Nusxalab bo‘lmadi', 'ok')

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  return (
    <>
      <PageHead title="O‘qituvchilar" desc="Bu yerda qo‘shilgan o‘qituvchilar saytda ham, Telegram botdagi “O‘qituvchilar” bo‘limida ham ko‘rinadi.">
        <button type="button" className="a-btn ghost" onClick={() => setBulk('')}><ListPlus size={16} /> Ro‘yxat bilan qo‘shish</button>
        <button type="button" className="a-btn" onClick={() => setForm({ ...blank })}><Plus size={16} /> O‘qituvchi qo‘shish</button>
      </PageHead>

      <label className="a-search">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ism, fan yoki lavozim bo‘yicha qidirish…" aria-label="Qidirish" />
      </label>

      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && list.length === 0 && <Empty>{data.length ? 'Hech narsa topilmadi.' : 'Hali o‘qituvchilar yo‘q.'}</Empty>}

      <div className="a-teacher-list">
        {list.map((t) => (
          <article className="a-card a-teacher" key={t.id}>
            <div className="a-teacher-top">
              <div className="a-avatar-lg">
                {t.photo_url ? <img src={t.photo_url} alt="" /> : initials(t.full_name)}
              </div>
              <div className="a-teacher-info">
                <h3>{t.full_name}</h3>
                <p>{[t.subject, t.position].filter(Boolean).join(' · ') || 'Fan va lavozim kiritilmagan'}</p>
                <div className="a-badges">
                  <span className={`a-badge ${t.show_on_site ? 'ok' : ''}`}>{t.show_on_site ? 'Saytda va botda ko‘rinadi' : 'Yashirin'}</span>
                  <span className={`a-badge ${t.bound ? 'ok' : ''}`}>{t.bound ? 'Botga ulangan' : 'Botga ulanmagan'}</span>
                  <span className="a-badge">{t.lessons} dars</span>
                </div>
              </div>
            </div>
            <div className="a-teacher-code">
              <span>Bot kodi</span>
              <code>{t.code}</code>
              <button type="button" className="a-icon-btn" onClick={() => void copy(t.code)} aria-label="Kodni nusxalash"><Copy size={16} /></button>
            </div>
            <div className="a-actions">
              <button type="button" className="a-btn ghost sm" onClick={() => edit(t)}><Pencil size={14} /> Tahrirlash</button>
              <button type="button" className="a-btn ghost sm" onClick={() => void act(() => adminApi.post('teachers', 'toggle', { id: t.id }), t.show_on_site ? 'Yashirildi' : 'Ko‘rsatiladi')}>
                {t.show_on_site ? <><EyeOff size={14} /> Yashirish</> : <><Eye size={14} /> Ko‘rsatish</>}
              </button>
              <button type="button" className="a-btn ghost sm" onClick={() => void regen(t)}><KeyRound size={14} /> Yangi kod</button>
              {t.bound && <button type="button" className="a-btn ghost sm" onClick={() => void unbind(t)}><Link2Off size={14} /> Uzish</button>}
              <button type="button" className="a-btn ghost sm danger" onClick={() => void remove(t)}><Trash2 size={14} /> O‘chirish</button>
            </div>
          </article>
        ))}
      </div>

      {form && (
        <Modal title={form.id ? 'O‘qituvchini tahrirlash' : 'Yangi o‘qituvchi'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="a-form">
            <Field label="Ism va familiya *" hint="Masalan: Karimova Dilnoza">
              <input className="a-input" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required maxLength={100} autoFocus />
            </Field>
            <div className="a-form-2">
              <Field label="Fan">
                <input className="a-input" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Matematika" maxLength={80} />
              </Field>
              <Field label="Tajriba">
                <input className="a-input" value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="8 yillik tajriba" maxLength={60} />
              </Field>
            </div>
            <Field label="Lavozim">
              <input className="a-input" value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="Matematika fani o‘qituvchisi" maxLength={160} />
            </Field>
            <Field label="Qisqacha ma’lumot">
              <textarea className="a-input" rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={1500} />
            </Field>
            <ImageField label="Rasm" value={form.photo} onChange={(v) => set('photo', v)} />
            <div className="a-form-2">
              <Field label="Tartib raqami" hint="Kichik raqam — ro‘yxatda yuqoriroq">
                <input className="a-input" type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} />
              </Field>
              <label className="a-check-row">
                <input type="checkbox" checked={form.show_on_site} onChange={(e) => set('show_on_site', e.target.checked)} />
                <span>Saytda va botda ko‘rsatish</span>
              </label>
            </div>
            <div className="a-modal-actions">
              <button type="button" className="a-btn ghost" onClick={() => setForm(null)}>Bekor qilish</button>
              <button type="submit" className="a-btn" disabled={busy}>Saqlash</button>
            </div>
          </form>
        </Modal>
      )}

      {bulk !== null && (
        <Modal title="Ro‘yxat bilan qo‘shish" onClose={() => setBulk(null)}>
          <form onSubmit={saveBulk} className="a-form">
            <Field label="Har qatorga bitta ism-familiya" hint="Qolgan ma’lumotlarni keyin tahrirlash orqali to‘ldirasiz. Har biriga bot kodi avtomatik beriladi.">
              <textarea className="a-input" rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'Karimova Dilnoza\nSamadov Muhammadjon'} autoFocus />
            </Field>
            <div className="a-modal-actions">
              <button type="button" className="a-btn ghost" onClick={() => setBulk(null)}>Bekor qilish</button>
              <button type="submit" className="a-btn" disabled={busy}>Qo‘shish</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
