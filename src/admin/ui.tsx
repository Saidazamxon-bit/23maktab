import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { adminApi } from '../lib/api'

// ---------------------------------------------------------------- xabarlar va tasdiqlash

interface Toast { id: number; text: string; kind: 'ok' | 'err' }
interface ConfirmState { text: string; danger: boolean; resolve: (v: boolean) => void }

interface UiCtx {
  toast: (text: string, kind?: 'ok' | 'err') => void
  confirm: (text: string, danger?: boolean) => Promise<boolean>
}

const Ctx = createContext<UiCtx | undefined>(undefined)

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [conf, setConf] = useState<ConfirmState | null>(null)
  const idRef = useRef(1)

  const toast = useCallback((text: string, kind: 'ok' | 'err' = 'ok') => {
    const id = idRef.current++
    setToasts((p) => [...p, { id, text, kind }])
    window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), kind === 'err' ? 6000 : 3000)
  }, [])

  const confirm = useCallback(
    (text: string, danger = true) => new Promise<boolean>((resolve) => setConf({ text, danger, resolve })),
    [],
  )

  const close = (v: boolean) => {
    conf?.resolve(v)
    setConf(null)
  }

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="a-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.kind}`} role={t.kind === 'err' ? 'alert' : 'status'}>{t.text}</div>
        ))}
      </div>
      {conf && (
        <Modal title="Tasdiqlang" onClose={() => close(false)} small>
          <p className="a-confirm-text">{conf.text}</p>
          <div className="a-modal-actions">
            <button type="button" className="a-btn ghost" onClick={() => close(false)}>Bekor qilish</button>
            <button type="button" className={`a-btn ${conf.danger ? 'danger-solid' : ''}`} onClick={() => close(true)} autoFocus>
              Ha, davom etish
            </button>
          </div>
        </Modal>
      )}
    </Ctx.Provider>
  )
}

export function useUi(): UiCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUi must be used within UiProvider')
  return v
}

/** Xatoni foydalanuvchiga ko'rsatiladigan matnga aylantiradi. */
export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Xatolik yuz berdi'
}

// ---------------------------------------------------------------- modal

export function Modal({ title, onClose, children, small }: { title: string; onClose: () => void; children: ReactNode; small?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="a-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`a-modal ${small ? 'small' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-modal-head">
          <h2>{title}</h2>
          <button type="button" className="a-icon-btn" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        </div>
        <div className="a-modal-body">{children}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- maydonlar

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="a-field">
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="a-hint">{hint}</span>}
    </label>
  )
}

/** Rasm: fayl yuklash yoki havola kiritish. `value` — bazaga saqlanadigan yo'l/havola. */
export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { toast } = useUi()
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = /^https?:\/\//i.test(value) ? value : value ? `${adminBase()}/${value}` : ''

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try {
      const r = await adminApi.upload(f)
      onChange(r.path)
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image-field">
        <div className="a-image-preview">
          {preview ? <img src={preview} alt="" /> : <ImagePlus size={26} aria-hidden="true" />}
        </div>
        <div className="a-image-controls">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
          <div className="a-row">
            <button type="button" className="a-btn ghost sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? <Loader2 size={14} className="spin" /> : <ImagePlus size={14} />} Rasm yuklash
            </button>
            {value && <button type="button" className="a-btn ghost sm" onClick={() => onChange('')}>Olib tashlash</button>}
          </div>
          <input
            type="text"
            className="a-input"
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="yoki rasm havolasi: https://..."
            aria-label={`${label} havolasi`}
          />
        </div>
      </div>
    </div>
  )
}

function adminBase(): string {
  // Yuklangan rasmlar backend papkasida turadi; ko'rsatish uchun to'liq manzil kerak.
  // API_BASE nisbiy ("/backend") bo'lgani uchun uni Vercel rewrite orqali ochamiz.
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/backend'
}

// ---------------------------------------------------------------- yuklash holati

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fnRef.current())
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, reload, setData }
}

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  if (loading) return <div className="a-state"><Loader2 size={18} className="spin" /> Yuklanmoqda…</div>
  if (error) {
    return (
      <div className="a-state err" role="alert">
        <span>{error}</span>
        <button type="button" className="a-btn ghost sm" onClick={onRetry}>Qayta urinish</button>
      </div>
    )
  }
  return null
}

export function PageHead({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="a-head">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {children && <div className="a-head-actions">{children}</div>}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="a-empty">{children}</div>
}
