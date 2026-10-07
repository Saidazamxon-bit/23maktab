import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { AGallery } from '../types'
import { Empty, errMsg, Field, ImageField, LoadState, Modal, PageHead, useLoad, useUi } from '../ui'

interface Form { id: number; title: string; image: string; sort_order: number }

export function GalleryAdminPage() {
  const { toast, confirm } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ gallery: AGallery[] }>('gallery').then((r) => r.gallery))
  const [form, setForm] = useState<Form | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    setBusy(true)
    try {
      await adminApi.post('gallery', 'save', { ...form })
      toast('Saqlandi')
      setForm(null)
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const remove = async (g: AGallery) => {
    if (!(await confirm('Bu rasmni o‘chirasizmi?'))) return
    try { await adminApi.post('gallery', 'delete', { id: g.id }); toast('O‘chirildi'); await reload() } catch (err) { toast(errMsg(err), 'err') }
  }

  return (
    <>
      <PageHead title="Galereya" desc="Bosh sahifadagi “Maktab hayoti” rasmlari. Birinchi rasm katta ko‘rsatiladi.">
        <button type="button" className="a-btn" onClick={() => setForm({ id: 0, title: '', image: '', sort_order: 0 })}><Plus size={16} /> Rasm qo‘shish</button>
      </PageHead>
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && data.length === 0 && <Empty>Galereya bo‘sh.</Empty>}
      <div className="a-gallery">
        {(data || []).map((g) => (
          <figure className="a-card a-gallery-item" key={g.id}>
            <img src={g.image_url} alt={g.title} loading="lazy" />
            <figcaption>
              <span>{g.title || 'Nomsiz'}<small>№ {g.sort_order}</small></span>
              <span>
                <button type="button" className="a-icon-btn" onClick={() => setForm({ id: g.id, title: g.title, image: g.image, sort_order: g.sort_order })} aria-label="Tahrirlash"><Pencil size={16} /></button>
                <button type="button" className="a-icon-btn" onClick={() => void remove(g)} aria-label="O‘chirish"><Trash2 size={16} /></button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {form && (
        <Modal title={form.id ? 'Rasmni tahrirlash' : 'Yangi rasm'} onClose={() => setForm(null)} small>
          <form onSubmit={save} className="a-form">
            <ImageField label="Rasm *" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            <Field label="Sarlavha"><input className="a-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} /></Field>
            <Field label="Tartib raqami" hint="Kichik raqam — oldinroq. Bo‘sh (0) qoldirsangiz oxiriga qo‘shiladi.">
              <input className="a-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
            </Field>
            <div className="a-modal-actions">
              <button type="button" className="a-btn ghost" onClick={() => setForm(null)}>Bekor qilish</button>
              <button type="submit" className="a-btn" disabled={busy || !form.image}>Saqlash</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
