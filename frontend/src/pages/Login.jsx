import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext.jsx'
import BrandMark from '../components/BrandMark.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to={location.state?.from || homeFor(user)} replace />

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const u = await login(f.email, f.password)
      nav(location.state?.from || homeFor(u), { replace: true })
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth">
      <form className="panel auth-card" onSubmit={submit}>
        <Link to="/web-it" className="brand" aria-label="VIENXA GROUP"><BrandMark /></Link>
        <h2>Masuk</h2>
        <p className="muted">Masuk sebagai super admin atau pembeli.</p>
        {err && <div className="alert">{err}</div>}
        <label>Email<input type="email" required autoFocus value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label style={{ position: 'relative', display: 'block' }}>
          Kata sandi
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            style={{ paddingRight: '36px' }}
          />
          <button
            type="button"
            className="toggle-pw"
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Memproses…' : 'Login'}</button>
        <p className="muted">Belum punya akun? <Link className="lnk" to="/register">Daftar sebagai pembeli</Link></p>
        <Link className="lnk muted" to="/web-it">← Kembali ke Web &amp; IT</Link>
      </form>
    </div>
  )
}
