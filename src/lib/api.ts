// Backend (PHP + MySQL) bilan aloqa.
// Productionda so'rovlar Vercel orqali `/backend/...` ga yuboriladi (vercel.json), lokal ishlaganda vite proxy ishlatadi.
export const API_BASE: string = ((import.meta.env.VITE_API_URL as string | undefined) || '/backend').replace(/\/$/, '')

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_username'

export class ApiError extends Error {
  status: number
  data: Record<string, unknown>
  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message)
    this.status = status
    this.data = data
  }
}

export const tokenStore = {
  get: (): string => {
    try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
  },
  set: (token: string, username: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, username)
    } catch { /* ignore */ }
  },
  username: (): string => {
    try { return localStorage.getItem(USER_KEY) || '' } catch { return '' }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch { /* ignore */ }
  },
}

type Query = Record<string, string | number | undefined>

function buildUrl(script: string, resource: string, query?: Query): string {
  const qs = new URLSearchParams({ r: resource })
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    })
  }
  return `${API_BASE}/${script}?${qs.toString()}`
}

async function parse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  try {
    const data = JSON.parse(text)
    return data && typeof data === 'object' ? data : {}
  } catch {
    // PHP xatosi yoki noto'g'ri manzil: JSON emas
    throw new ApiError("Server noto'g'ri javob qaytardi. Backend manzilini tekshiring.", res.status || 502)
  }
}

async function call<T>(script: string, resource: string, init: RequestInit & { query?: Query }, auth: boolean): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) }
  if (auth) {
    const token = tokenStore.get()
    if (token) headers['X-Auth-Token'] = token
  }
  let res: Response
  try {
    res = await fetch(buildUrl(script, resource, init.query), { ...init, headers })
  } catch {
    throw new ApiError("Serverga ulanib bo'lmadi. Internetni tekshiring.", 0)
  }
  const data = await parse(res)
  if (!res.ok) {
    if (res.status === 401 && auth && resource !== 'login') {
      tokenStore.clear()
      window.dispatchEvent(new Event('admin:unauthorized'))
    }
    throw new ApiError(String(data.error || `Xatolik (${res.status})`), res.status, data)
  }
  return data as T
}

/** Sayt uchun ochiq ma'lumot (kirish talab qilinmaydi). */
export const publicApi = {
  get: <T>(resource: string, query?: Query) => call<T>('public.php', resource, { method: 'GET', query }, false),
}

/** Admin API (token bilan). */
export const adminApi = {
  get: <T>(resource: string, query?: Query) => call<T>('api.php', resource, { method: 'GET', query }, true),
  post: <T>(resource: string, action: string, body: Record<string, unknown> = {}) =>
    call<T>('api.php', resource, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    }, true),
  login: (username: string, password: string) =>
    call<{ token: string; username: string }>('api.php', 'login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }, false),
  upload: async (file: File): Promise<{ path: string; url: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    return call<{ path: string; url: string }>('api.php', 'upload', { method: 'POST', body: fd }, true)
  },
}
