import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { ABell } from '../types'
import { errMsg, LoadState, PageHead, useLoad, useUi } from '../ui'

export function BellsPage() {
  const { toast } = useUi()
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ bells: ABell[] }>('bells').then((r) => r.bells))
  const [rows, setRows] = useState<ABell[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (data) setRows(data) }, [data])

  const setRow = (i: number, patch: Partial<ABell>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const add = () => {
    const last = rows[rows.length - 1]
    setRows([...rows, { lesson_no: (last?.lesson_no || 0) + 1, start_time: last?.end_time || '08:00', end_time: '' }])
  }
  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i))

  const save = async () => {
    setBusy(true)
    try {
      await adminApi.post('bells', 'save', { bells: rows })
      toast('Qo‘ng‘iroq jadvali saqlandi')
      await reload()
    } catch (err) { toast(errMsg(err), 'err') } finally { setBusy(false) }
  }

  return (
    <>
      <PageHead title="Qo‘ng‘iroqlar" desc="Dars boshlanish va tugash vaqtlari. Sayt, bot (“Hozir”, “Keyingi”, eslatmalar) shundan foydalanadi.">
        <button type="button" className="a-btn ghost" onClick={add}><Plus size={16} /> Dars qo‘shish</button>
        <button type="button" className="a-btn" onClick={() => void save()} disabled={busy}>Saqlash</button>
      </PageHead>
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && (
        <div className="a-card">
          <table className="a-table">
            <thead><tr><th scope="col">Dars №</th><th scope="col">Boshlanishi</th><th scope="col">Tugashi</th><th scope="col"><span className="a-sr">Amal</span></th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><input className="a-input" type="number" min={1} max={12} value={r.lesson_no} onChange={(e) => setRow(i, { lesson_no: Number(e.target.value) })} aria-label="Dars raqami" /></td>
                  <td><input className="a-input" type="time" value={r.start_time} onChange={(e) => setRow(i, { start_time: e.target.value })} aria-label="Boshlanishi" /></td>
                  <td><input className="a-input" type="time" value={r.end_time} onChange={(e) => setRow(i, { end_time: e.target.value })} aria-label="Tugashi" /></td>
                  <td><button type="button" className="a-icon-btn" onClick={() => remove(i)} aria-label="Qatorni o‘chirish"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
