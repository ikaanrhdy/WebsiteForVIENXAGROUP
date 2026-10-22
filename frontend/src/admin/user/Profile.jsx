import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { Card } from '../ui.jsx'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', current_password: '', password: '', password_confirmation: '' })
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('')
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const save = async (e) => {
    e.preventDefault()
    setOk(''); setErr('')
    try {
      const payload = new FormData()
      payload.append('name', f.name)
      payload.append('phone', f.phone)
      if (f.password) {
        payload.append('current_password', f.current_password)
        payload.append('password', f.password)
        payload.append('password_confirmation', f.password_confirmation)
      }
      if (avatarFile) payload.append('avatar', avatarFile)
      const r = await api.post('/auth/profile', payload)
      setUser(r.data)
      setF({ ...f, current_password: '', password: '', password_confirmation: '' })
      setAvatarFile(null)
      setOk('Profil disimpan.')
    } catch (e2) { setErr(e2.message) }
  }

  return (
    <>
      <h1 className="ptitle">Profil</h1>
      <Card title="Data akun">
        <form className="form narrow" onSubmit={save}>
          {ok && <div className="alert ok">{ok}</div>}
          {err && <div className="alert">{err}</div>}
          <label>Email<input value={user.email} disabled /></label>
          <label>Foto profil
            {avatarPreview ? (
              <img className="profile-preview" src={avatarPreview} alt="Pratinjau foto profil" />
            ) : user.avatar ? (
              <img className="profile-preview" src={user.avatar} alt="Foto profil saat ini" />
            ) : <span className="muted">Belum ada foto profil.</span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
              const file = event.target.files?.[0] || null
              if (file && file.size > 2 * 1024 * 1024) {
                setErr('Ukuran foto maksimal 2 MB.')
                setAvatarFile(null)
                event.target.value = ''
                return
              }
              setErr('')
              setAvatarFile(file)
            }} />
            <small className="muted">JPG, PNG, atau WebP; maksimal 2 MB.</small>
          </label>
          <label>Nama lengkap<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label>No. WhatsApp<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <hr />
          <h3>Ubah kata sandi (opsional)</h3>
          <label>Kata sandi saat ini<input type="password" autoComplete="current-password" value={f.current_password} onChange={(e) => setF({ ...f, current_password: e.target.value })} /></label>
          <label>Kata sandi baru<input type="password" autoComplete="new-password" minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
          <label>Ulangi kata sandi baru<input type="password" autoComplete="new-password" value={f.password_confirmation} onChange={(e) => setF({ ...f, password_confirmation: e.target.value })} /></label>
          <button className="btn">Simpan</button>
        </form>
      </Card>
    </>
  )
}
