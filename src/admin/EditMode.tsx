import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Pencil, PencilOff } from 'lucide-react'
import { useAdminAuth } from './auth/AdminAuthContext'

interface EditModeCtx {
  /** Admin tizimga kirgan va tahrir rejimini yoqqan */
  canEdit: boolean
  editMode: boolean
  setEditMode: (v: boolean) => void
}

const Ctx = createContext<EditModeCtx | undefined>(undefined)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  const [editMode, setEditMode] = useState(false)
  const value = useMemo(
    () => ({ canEdit: isAuthenticated && editMode, editMode, setEditMode }),
    [isAuthenticated, editMode],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEditMode(): EditModeCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useEditMode must be used within EditModeProvider')
  return v
}

/** Faqat tizimga kirgan adminga ko'rinadigan suzuvchi panel (saytning ochiq qismida). */
export function EditModeBar() {
  const { isAuthenticated } = useAdminAuth()
  const { editMode, setEditMode } = useEditMode()
  if (!isAuthenticated) return null
  return (
    <div className="edit-bar" role="region" aria-label="Admin">
      <button type="button" className="edit-bar-btn" onClick={() => setEditMode(!editMode)} aria-pressed={editMode}>
        {editMode ? <PencilOff size={16} /> : <Pencil size={16} />}
        {editMode ? 'Tahrirni tugatish' : 'Matnlarni tahrirlash'}
      </button>
      <Link to="/admin" className="edit-bar-btn edit-bar-link">
        <LayoutDashboard size={16} /> Admin panel
      </Link>
    </div>
  )
}
