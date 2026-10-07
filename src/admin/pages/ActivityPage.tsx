import { adminApi } from '../../lib/api'
import type { AActivity } from '../types'
import { Empty, LoadState, PageHead, useLoad } from '../ui'

const ACTIONS: Record<string, string> = { create: 'Qo‘shildi', update: 'O‘zgartirildi', delete: 'O‘chirildi' }

export function ActivityPage() {
  const { data, loading, error, reload } = useLoad(() => adminApi.get<{ activity: AActivity[] }>('activity', { limit: 200 }).then((r) => r.activity))
  return (
    <>
      <PageHead title="Faoliyat jurnali" desc="Admin paneldagi so‘nggi 200 ta o‘zgarish." />
      <LoadState loading={loading} error={error} onRetry={() => void reload()} />
      {data && data.length === 0 && <Empty>Hali amallar yo‘q.</Empty>}
      {data && data.length > 0 && (
        <div className="a-card a-scroll">
          <table className="a-table">
            <thead><tr><th scope="col">Vaqt</th><th scope="col">Admin</th><th scope="col">Amal</th><th scope="col">Bo‘lim</th><th scope="col">Tafsilot</th></tr></thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>{a.created_at}</td><td>{a.admin_name}</td><td>{ACTIONS[a.action] || a.action}</td><td>{a.entity}</td><td>{a.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
