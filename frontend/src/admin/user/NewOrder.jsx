import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, rupiah } from '../../lib/api.js'
import { Card, SearchField, State } from '../ui.jsx'

export default function NewOrder() {
  const nav = useNavigate()
  const [packages, setPackages] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [f, setF] = useState({ package_id: null, project_name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const filteredPackages = (packages || []).filter((pack) => [
    pack.name, pack.audience, pack.description, ...(pack.features || []),
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  useEffect(() => {
    api.get('/packages').then((r) => { setPackages(r.data); if (r.data[0]) setF((s) => ({ ...s, package_id: r.data[0].id })) }).catch((e) => setLoadErr(e.message))
  }, [])

  const fe = (k) => errors[k] && <small className="field-err">{errors[k][0]}</small>
  const submit = async (e) => {
    e.preventDefault()
    setErrors({}); setMsg(''); setBusy(true)
    try { await api.post('/me/orders', f); nav('/dashboard/pesanan') }
    catch (e2) { setMsg(e2.message); setErrors(e2.errors) } finally { setBusy(false) }
  }

  return (
    <>
      <h1 className="ptitle">Pesan paket</h1>
      <State loading={!packages && !loadErr} error={loadErr} />
      {packages && (
        <form onSubmit={submit}>
          <Card title="1. Pilih paket" action={<SearchField value={search} onChange={setSearch} placeholder="Cari paket..." />}>
            {filteredPackages.length ? <div className="grid g3">
              {filteredPackages.map((p) => (
                <label key={p.id} className={f.package_id === p.id ? 'pick on' : 'pick'}>
                  <input type="radio" name="pkg" checked={f.package_id === p.id} onChange={() => setF({ ...f, package_id: p.id })} />
                  <b>{p.name}</b><span className="muted">{p.audience}</span>
                  <ul>{p.features.map((i) => <li key={i}>{i}</li>)}</ul>
                  <em>{p.price != null ? `Mulai ${rupiah(p.price)}` : 'Harga sesuai penawaran'}</em>
                </label>
              ))}
            </div> : <p className="muted">Tidak ada paket yang cocok dengan pencarian.</p>}
            {fe('package_id')}
          </Card>
          <Card title="2. Detail kebutuhan">
            {msg && <div className="alert">{msg}</div>}
            <div className="form">
              <label>Nama proyek / website<input required value={f.project_name} onChange={(e) => setF({ ...f, project_name: e.target.value })} />{fe('project_name')}</label>
              <label>Ceritakan kebutuhan Anda<textarea rows="5" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />{fe('description')}</label>
              <button className="btn" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim pesanan'}</button>
            </div>
          </Card>
        </form>
      )}
    </>
  )
}
