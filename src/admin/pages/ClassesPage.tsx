import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { AClass } from '../types'
import { Empty, errMsg, LoadState, PageHead, useLoad, useUi } from '../ui'

export function ClassesPage() {
  const { toast, confirm } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ classes: AClass[] }>('classes').then((r) => r.classes))
  const [grade, setGrade] = useState('5')
  const [letters, setLetters] = useState('A, B, V')
  const [busy, setBusy] = useState(false)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await adminApi.post<{ added: number }>('classes', 'add', { grade, letters })
      toast(r.added ? `${r.added} ta sinf qo‘shildi` : 'Yangi sinf qo‘shilmadi (allaqachon bor)')
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  const remove = async (c: AClass) => {
    const warn = c.lessons ? ` Uning ${c.lessons} ta darsi ham o‘chadi.` : ''
    if (!(await confirm(`${c.name} sinfini o‘chirasizmi?${warn}`))) return
    try {
      await adminApi.post('classes', 'delete', { id: c.id })
      toast('Sinf o‘chirildi')
      await reload()
    } catch (err) { toast(errMsg(err), 'err') }
  }

  const byGrade = new Map<number, AClass[]>()
  ;(data || []).forEach((c) => byGrade.set(c.grade, [...(byGrade.get(c.grade) || []), c]))

  return (
    <>
      <PageHead title="Sinflar" desc="Bot va sayt shu ro‘yxatdan foydalanadi: o‘quvchi botda sinf raqamini, so‘ng harfini tanlaydi." />
      <form className="a-card a-row-form" onSubmit={add}>
        <label className="a-field narrow">
          <span className="a-label">Sinf</span>
          <select className="a-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="all">Hammasi (1–11)</option>
            {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}-sinf</option>)}
          </select>
        </label>
        <label className="a-field grow">
          <span className="a-label">Harflar</span>
          <input className="a-input" value={letters} onChange={(e) => setLetters(e.target.value)} placeholder="A, B, V" />
        </label>
        <button type="submit" className="a-btn" disabled={busy}><Plus size={16} /> Qo‘shish</button>
      </form>

      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && data.length === 0 && <Empty>Hali sinflar yo‘q. Yuqoridan qo‘shing.</Empty>}
      {Array.from(byGrade.entries()).map(([g, list]) => (
        <section className="a-card" key={g}>
          <h2>{g}-sinflar</h2>
          <div className="a-chips">
            {list.map((c) => (
              <span className="a-chip" key={c.id}>
                <b>{c.name}</b>
                <small>{c.lessons} dars · {c.students} o‘quvchi</small>
                <button type="button" onClick={() => void remove(c)} aria-label={`${c.name} sinfini o‘chirish`}><Trash2 size={14} /></button>
              </span>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
