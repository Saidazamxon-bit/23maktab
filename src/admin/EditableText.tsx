import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, Edit2, X } from 'lucide-react'
import { useLanguage } from '../i18n'
import { useSiteData } from '../lib/siteData'
import { useEditMode } from './EditMode'
import './EditableText.css'

interface EditableTextProps {
  contentKey: string
  value: string | undefined
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  className?: string
  multiline?: boolean
}

/**
 * Oddiy foydalanuvchiga matnni ko'rsatadi. Admin tahrir rejimini yoqsa, matnni bosib o'zgartirish mumkin —
 * o'zgarish bazaga saqlanadi va barcha foydalanuvchilarga ko'rinadi (til bo'yicha alohida).
 */
export function EditableText({ contentKey, value, tag = 'p', className, multiline = false }: EditableTextProps) {
  const { language } = useLanguage()
  const { content, saveText } = useSiteData()
  const { canEdit } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayValue = content[language]?.[contentKey] || value || ''
  const Tag = tag as React.ElementType

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Tahrir rejimi o'chirilsa — ochiq tahrirlagich yopiladi
  useEffect(() => {
    if (!canEdit) setIsEditing(false)
  }, [canEdit])

  const startEdit = () => {
    setEditValue(displayValue)
    setError('')
    setIsEditing(true)
  }

  const cancel = () => {
    setIsEditing(false)
    setError('')
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      // Matn asl qiymat bilan bir xil bo'lsa — o'zgartirish o'chiriladi (standart matnga qaytadi)
      const next = editValue.trim() === (value || '').trim() ? '' : editValue
      await saveText(language, contentKey, next)
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlab bo‘lmadi')
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); void save() }
    if (e.key === 'Escape') cancel()
  }

  if (!canEdit) return <Tag className={className}>{displayValue}</Tag>

  return (
    <div ref={containerRef} className={`editable-text-wrapper ${isEditing ? 'editing' : ''}`}>
      {!isEditing ? (
        <div className="editable-text-display" onDoubleClick={startEdit}>
          <Tag className={className}>{displayValue}</Tag>
          <button type="button" className="editable-text-trigger" onClick={startEdit} aria-label="Matnni tahrirlash">
            <Edit2 size={14} />
          </button>
        </div>
      ) : (
        <div className="editable-text-editor">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="editable-text-input"
              rows={4}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="editable-text-input"
            />
          )}
          <div className="editable-text-actions">
            <button type="button" className="btn-save" onClick={() => void save()} disabled={saving} title="Saqlash (Enter)">
              <Check size={16} />
            </button>
            <button type="button" className="btn-cancel" onClick={cancel} disabled={saving} title="Bekor qilish (Esc)">
              <X size={16} />
            </button>
          </div>
          {error && <div className="editable-text-error">{error}</div>}
        </div>
      )}
    </div>
  )
}
