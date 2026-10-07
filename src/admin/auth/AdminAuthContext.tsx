import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminApi, tokenStore } from '../../lib/api'

interface AdminAuth {
  username: string | null
  isAuthenticated: boolean
  /** Saqlangan sessiya serverda tekshirilmoqda */
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AdminAuth | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => tokenStore.get() !== '')

  // Sahifa ochilganda saqlangan sessiya hali amal qilayotganini tekshiramiz
  useEffect(() => {
    if (!tokenStore.get()) {
      setIsLoading(false)
      return
    }
    let alive = true
    adminApi
      .get<{ username: string }>('me')
      .then((r) => { if (alive) setUsername(r.username) })
      .catch(() => { if (alive) tokenStore.clear() })
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  // Sessiya tugasa (401) avtomatik chiqamiz
  useEffect(() => {
    const onUnauthorized = () => setUsername(null)
    window.addEventListener('admin:unauthorized', onUnauthorized)
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (user: string, password: string) => {
    const r = await adminApi.login(user.trim(), password)
    tokenStore.set(r.token, r.username)
    setUsername(r.username)
  }, [])

  const logout = useCallback(async () => {
    try { await adminApi.post('logout', '') } catch { /* sessiya baribir o'chiriladi */ }
    tokenStore.clear()
    setUsername(null)
  }, [])

  const value = useMemo(
    () => ({ username, isAuthenticated: username !== null, isLoading, login, logout }),
    [username, isLoading, login, logout],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdminAuth(): AdminAuth {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return v
}
