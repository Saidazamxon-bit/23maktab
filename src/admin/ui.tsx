import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ImagePlus, Loader2, RotateCcw, RotateCw, X } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
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
  const [cropOpen, setCropOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState('')
  const [cropZoom, setCropZoom] = useState(1)
  const [cropRotation, setCropRotation] = useState(0)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropArea, setCropArea] = useState<Area>({ x: 0, y: 0, width: 0, height: 0 })
  const [cropAspect, setCropAspect] = useState<number>(1)
  const cropSurfaceRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = /^https?:\/\//i.test(value) ? value : value ? `${adminBase()}/${value}` : ''

  const resetCropState = useCallback(() => {
    setCropZoom(1)
    setCropRotation(0)
    setCropPosition({ x: 0, y: 0 })
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
  }, [])

  useEffect(() => {
    if (!cropOpen || !cropSurfaceRef.current) return

    const updateAspect = () => {
      const rect = cropSurfaceRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      setCropAspect(rect.width / rect.height)
    }

    updateAspect()
    const observer = new ResizeObserver(updateAspect)
    observer.observe(cropSurfaceRef.current)
    return () => observer.disconnect()
  }, [cropOpen])

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try {
      const cropped = await cropToSquare(f)
      const r = await adminApi.upload(cropped)
      onChange(r.path)
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const openCrop = async () => {
    if (!preview) return
    try {
      const res = await fetch(preview)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      resetCropState()
      setCropSrc(url)
      setCropOpen(true)
    } catch {
      toast('Rasmni crop qilish uchun yuklab bo‘lmadi', 'err')
    }
  }

  const applyCrop = async () => {
    if (!cropSrc || !cropArea.width || !cropArea.height) {
      toast('Crop hududini tanlang', 'err')
      return
    }
    setBusy(true)
    try {
      const blob = await getCroppedImage(cropSrc, cropArea, cropRotation)
      if (!blob) throw new Error('Rasmni crop qilish amalga oshmadi')
      const file = new File([blob], 'teacher-photo-cropped.jpg', { type: blob.type || 'image/jpeg' })
      const r = await adminApi.upload(file)
      onChange(r.path)
      setCropOpen(false)
      setCropSrc('')
      resetCropState()
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
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
              {preview && <button type="button" className="a-btn ghost sm" onClick={() => void openCrop()} disabled={busy}>Crop</button>}
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

      {cropOpen && (
        <div className="a-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) setCropOpen(false) }}>
          <div className="a-modal a-crop-modal" role="dialog" aria-modal="true" aria-label="Rasmni crop qilish">
            <div className="a-modal-head">
              <h2>Rasmni crop qilish</h2>
              <button type="button" className="a-icon-btn" onClick={() => setCropOpen(false)} aria-label="Yopish"><X size={18} /></button>
            </div>
            <div className="a-modal-body">
              <div className="a-crop-stage" ref={cropSurfaceRef}>
                <div className="a-crop-surface">
                  <Cropper
                    image={cropSrc}
                    crop={cropPosition}
                    zoom={cropZoom}
                    rotation={cropRotation}
                    aspect={cropAspect}
                    onCropChange={setCropPosition}
                    onCropComplete={(_, areaPixels) => setCropArea(areaPixels)}
                    onZoomChange={setCropZoom}
                    onRotationChange={setCropRotation}
                    showGrid
                    cropShape="rect"
                    objectFit="contain"
                    restrictPosition
                    minZoom={1}
                    maxZoom={3}
                  />
                </div>
              </div>

              <div className="a-crop-controls">
                <div className="a-crop-panel">
                  <label className="a-crop-slider">
                    <span>Zoom</span>
                    <input type="range" min="1" max="3" step="0.01" value={cropZoom} onChange={(e) => setCropZoom(Number(e.target.value))} />
                  </label>
                </div>

                <div className="a-crop-panel">
                  <div className="a-crop-rotate-row">
                    <button type="button" className="a-btn ghost sm" onClick={() => setCropRotation((v) => (v - 90 + 360) % 360)}>
                      <RotateCcw size={14} /> Chapga
                    </button>
                    <button type="button" className="a-btn ghost sm" onClick={() => setCropRotation((v) => (v + 90) % 360)}>
                      <RotateCw size={14} /> O‘ngga
                    </button>
                  </div>
                </div>
              </div>

              <div className="a-modal-actions">
                <button type="button" className="a-btn ghost" onClick={() => setCropOpen(false)}>Bekor qilish</button>
                <button type="button" className="a-btn ghost" onClick={() => resetCropState()}>Qayta tiklash</button>
                <button type="button" className="a-btn" disabled={busy} onClick={() => void applyCrop()}>Crop qilish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function VideoField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { toast } = useUi()
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = value && /^https?:\/\//i.test(value) ? value : value ? `${adminBase()}/${value}` : ''

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
      <div className="a-video-field">
        <div className="a-video-preview">
          {preview ? (
            /^https?:\/\//i.test(value) ? (
              <div className="a-video-chip">YouTube / video link</div>
            ) : (
              <video src={preview} controls muted playsInline preload="metadata" />
            )
          ) : (
            <div className="a-video-empty">Video</div>
          )}
        </div>
        <div className="a-image-controls">
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
          <div className="a-row">
            <button type="button" className="a-btn ghost sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? <Loader2 size={14} className="spin" /> : <ImagePlus size={14} />} Video yuklash
            </button>
            {value && <button type="button" className="a-btn ghost sm" onClick={() => onChange('')}>Olib tashlash</button>}
          </div>
          <input
            type="text"
            className="a-input"
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="YouTube yoki video havolasi"
            aria-label={`${label} havolasi`}
          />
        </div>
      </div>
    </div>
  )
}

const createImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Rasm yuklab bo‘lmadi')))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })

async function getCroppedImage(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const rotCanvas = document.createElement('canvas')
  rotCanvas.width = image.naturalWidth
  rotCanvas.height = image.naturalHeight

  const rotContext = rotCanvas.getContext('2d')
  if (!rotContext) return null

  const rad = (rotation * Math.PI) / 180
  rotContext.translate(rotCanvas.width / 2, rotCanvas.height / 2)
  rotContext.rotate(rad)
  rotContext.translate(-rotCanvas.width / 2, -rotCanvas.height / 2)
  rotContext.drawImage(image, 0, 0)

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = pixelCrop.width
  resultCanvas.height = pixelCrop.height

  const resultContext = resultCanvas.getContext('2d')
  if (!resultContext) return null

  resultContext.drawImage(
    rotCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve) => {
    resultCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
  })
}

async function cropToSquare(file: File, zoom = 1, offsetX = 0, offsetY = 0): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Rasm yuklab bo‘lmadi'))
      image.src = url
    })

    const baseSize = Math.min(img.naturalWidth, img.naturalHeight)
    const w = Math.max(1, img.naturalWidth / zoom)
    const h = Math.max(1, img.naturalHeight / zoom)
    const sx = Math.max(0, Math.min(img.naturalWidth - w, (img.naturalWidth - w) / 2 + (offsetX / 100) * img.naturalWidth * 0.8))
    const sy = Math.max(0, Math.min(img.naturalHeight - h, (img.naturalHeight - h) / 2 + (offsetY / 100) * img.naturalHeight * 0.8))

    const canvas = document.createElement('canvas')
    canvas.width = baseSize
    canvas.height = baseSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, baseSize, baseSize)
    ctx.drawImage(img, sx, sy, w, h, 0, 0, baseSize, baseSize)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type || 'image/jpeg', 0.9))
    if (!blob) return file

    const cropped = new File([blob], file.name || 'teacher-photo.jpg', { type: blob.type || 'image/jpeg' })
    return cropped
  } finally {
    URL.revokeObjectURL(url)
  }
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
