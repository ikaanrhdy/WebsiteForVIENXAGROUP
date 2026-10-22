import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext.jsx'
import BrandMark from '../components/BrandMark.jsx'

export default function Register() {
  const { user, register } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (user) return <Navigate to={homeFor(user)} replace />
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fe = (k) => errors[k] && <small className="field-err">{errors[k][0]}</small>

  const submit = async (e) => {
    e.preventDefault()
    setErrors({}); setMsg(''); setBusy(true)
    try {
      const u = await register(f)
      nav(homeFor(u), { replace: true })
    } catch (e2) { setMsg(e2.message); setErrors(e2.errors) } finally { setBusy(false) }
  }

  return (
    <div className="auth">
      <form className="panel auth-card" onSubmit={submit}>
        <Link to="/web-it" className="brand" aria-label="VIENXA GROUP"><BrandMark /></Link>
        <h2>Daftar pembeli</h2>
        {msg && <div className="alert">{msg}</div>}
        <label>Nama lengkap<input required value={f.name} onChange={set('name')} />{fe('name')}</label>
        <label>Email<input type="email" required value={f.email} onChange={set('email')} />{fe('email')}</label>
        <label>No. WhatsApp<input value={f.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />{fe('phone')}</label>
        <label style={{ position: 'relative', display: 'block' }}>
          Kata sandi
          <input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} style={{ paddingRight: '36px' }} />
          <button type="button" className="toggle-pw" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁'}</button>
          {fe('password')}
        </label>
        <label style={{ position: 'relative', display: 'block' }}>
          Ulangi kata sandi
          <input type={showConfirmation ? 'text' : 'password'} required autoComplete="new-password" value={f.password_confirmation} onChange={set('password_confirmation')} style={{ paddingRight: '36px' }} />
          <button type="button" className="toggle-pw" aria-label={showConfirmation ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowConfirmation(!showConfirmation)}>{showConfirmation ? '🙈' : '👁'}</button>
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Memproses…' : 'Daftar'}</button>
        <p className="muted">Sudah punya akun? <Link className="lnk" to="/login">Login</Link></p>
      </form>
    </div>
  )
}
