import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2 } from 'lucide-react'
import { useAdminAuth } from '../auth/AdminAuthContext'
import { errMsg } from '../ui'
import '../admin.css'

export function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAdminAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (loc.state as { from?: string } | null)?.from || '/admin'
  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-root">
      <div className="a-login-wrap">
        <form className="a-login" onSubmit={submit}>
          <div className="a-login-logo"><GraduationCap size={28} /></div>
          <h1>Admin panel</h1>
          <p>23-maktab saytini va Telegram botni boshqarish</p>
          <label className="a-field">
            <span className="a-label">Login</span>
            <input className="a-input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label className="a-field">
            <span className="a-label">Parol</span>
            <input className="a-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <div className="a-alert" role="alert">{error}</div>}
          <button type="submit" className="a-btn block" disabled={busy}>
            {busy && <Loader2 size={16} className="spin" />} Kirish
          </button>
        </form>
      </div>
    </div>
  )
}
