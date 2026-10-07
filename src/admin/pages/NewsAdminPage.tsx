import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { ANews } from '../types'
import { Empty, errMsg, Field, ImageField, LoadState, Modal, PageHead, useLoad, useUi } from '../ui'

interface Form { id: number; title: string; category: string; content: string; image: string; published_at: string; is_published: boolean }
const today = () => new Date().toISOString().slice(0, 10)
const blank = (): Form => ({ id: 0, title: '', category: '', content: '', image: '', published_at: today(), is_published: true })

export function NewsAdminPage() {
  const { toast, confirm } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ news: ANews[] }>('news').then((r) => r.news))
  const [form, setForm] = useState<Form | null>(null)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    setBusy(true)
    try {
      await adminApi.post('news', 'save', { ...form })
      toast('Saqlandi')
      setForm(null)
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const toggle = async (n: ANews) => {
    try { await adminApi.post('news', 'toggle', { id: n.id }); await reload() } catch (err) { toast(errMsg(err), 'err') }
  }

  const remove = async (n: ANews) => {
    if (!(await confirm(`“${n.title}” yangiligini o‘chirasizmi?`))) return
    try { await adminApi.post('news', 'delete', { id: n.id }); toast('O‘chirildi'); await reload() } catch (err) { toast(errMsg(err), 'err') }
  }

  return (
    <>
      <PageHead title="Yangiliklar" desc="Saytning bosh sahifasidagi “Maktab hayotidan” bo‘limi. Kelajak sanasini qo‘ysangiz, o‘sha kuni chiqadi.">
        <button type="button" className="a-btn" onClick={() => setForm(blank())}><Plus size={16} /> Yangilik qo‘shish</button>
      </PageHead>
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && data.length === 0 && <Empty>Hali yangiliklar yo‘q.</Empty>}
      <div className="a-media-list">
        {(data || []).map((n) => (
          <article className="a-card a-media-card" key={n.id}>
            <div className="a-media-thumb">{n.image_url ? <img src={n.image_url} alt="" loading="lazy" /> : <span>Rasm yo‘q</span>}</div>
            <div className="a-media-body">
              <div className="a-badges">
                {n.category && <span className="a-badge">{n.category}</span>}
                <span className={`a-badge ${n.is_published ? 'ok' : ''}`}>{n.is_published ? 'E’lon qilingan' : 'Qoralama'}</span>
                <span className="a-badge">{n.published_at}</span>
              </div>
              <h3>{n.title}</h3>
              <div className="a-actions">
                <button type="button" className="a-btn ghost sm" onClick={() => setForm({ ...n })}><Pencil size={14} /> Tahrirlash</button>
                <button type="button" className="a-btn ghost sm" onClick={() => void toggle(n)}>
                  {n.is_published ? <><EyeOff size={14} /> Yashirish</> : <><Eye size={14} /> E’lon qilish</>}
                </button>
                <button type="button" className="a-btn ghost sm danger" onClick={() => void remove(n)}><Trash2 size={14} /> O‘chirish</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {form && (
        <Modal title={form.id ? 'Yangilikni tahrirlash' : 'Yangi yangilik'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="a-form">
            <Field label="Sarlavha *"><input className="a-input" value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} autoFocus /></Field>
            <div className="a-form-2">
              <Field label="Kategoriya" hint="Masalan: Yutuqlar, Tadbir, Sport"><input className="a-input" value={form.category} onChange={(e) => set('category', e.target.value)} maxLength={60} /></Field>
              <Field label="Sana"><input className="a-input" type="date" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} /></Field>
            </div>
            <Field label="Matn"><textarea className="a-input" rows={6} value={form.content} onChange={(e) => set('content', e.target.value)} /></Field>
            <ImageField label="Rasm" value={form.image} onChange={(v) => set('image', v)} />
            <label className="a-check-row">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
              <span>Saytda ko‘rsatish</span>
            </label>
            <div className="a-modal-actions">
              <button type="button" className="a-btn ghost" onClick={() => setForm(null)}>Bekor qilish</button>
              <button type="submit" className="a-btn" disabled={busy}>Saqlash</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
