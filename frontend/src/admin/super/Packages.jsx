import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api, rupiah } from '../../lib/api.js'
import { Card, State, Modal, SearchField } from '../ui.jsx'

const blank = { name: '', audience: '', description: '', features: '', price: '', featured: false, is_active: true }

export default function Packages() {
  const { data, loading, error, reload } = useApi('/admin/packages')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [err, setErr] = useState('')
  const filteredPackages = (data?.data || []).filter((pack) => [
    pack.name, pack.audience, pack.description, ...(pack.features || []),
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const open = (p) => {
    setErr('')
    setForm(p ? { ...p, features: (p.features || []).join('\n'), price: p.price ?? '' } : { ...blank })
  }
  const save = async (e) => {
    e.preventDefault()
    const body = {
      name: form.name, audience: form.audience || null, description: form.description || null,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      price: form.price === '' ? null : Number(form.price),
      featured: !!form.featured, is_active: !!form.is_active,
    }
    try {
      await (form.id ? api.put(`/admin/packages/${form.id}`, body) : api.post('/admin/packages', body))
      setForm(null); reload()
    } catch (e2) { setErr(e2.message) }
  }
  const remove = async (p) => {
    if (!window.confirm(`Hapus paket ${p.name}?`)) return
    try { await api.del(`/admin/packages/${p.id}`); reload() } catch (e2) { setErr(e2.message) }
  }

  return (
    <>
      <h1 className="ptitle">Paket layanan</h1>
      {err && !form && <div className="alert">{err}</div>}
      <Card title="Paket Web & IT" action={<div className="card-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari paket..." />
        <button className="btn sm" onClick={() => open(null)}>+ Tambah paket</button>
      </div>}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Untuk</th><th>Harga mulai</th><th>Fitur</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filteredPackages.length === 0 && <tr><td colSpan={6} className="muted">{search ? 'Tidak ada paket yang cocok dengan pencarian.' : 'Belum ada paket.'}</td></tr>}
                {filteredPackages.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b>{p.featured && <span className="badge info">Unggulan</span>}</td>
                    <td>{p.audience}</td><td>{rupiah(p.price)}</td><td>{p.features.length} item</td>
                    <td><span className={`badge ${p.is_active ? 'success' : 'secondary'}`}>{p.is_active ? 'Tampil' : 'Disembunyikan'}</span></td>
                    <td className="right">
                      <button className="btn sm ghost" onClick={() => open(p)}>Ubah</button>{' '}
                      <button className="btn sm danger" onClick={() => remove(p)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? 'Ubah paket' : 'Tambah paket'} onClose={() => setForm(null)}>
          <form className="form" onSubmit={save}>
            {err && <div className="alert">{err}</div>}
            <label>Nama paket<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Cocok untuk<input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label>
            <label>Deskripsi<textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Fitur (satu per baris)<textarea rows="4" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></label>
            <label>Harga mulai (Rp, kosongkan jika sesuai penawaran)<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label className="chk"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Tandai sebagai unggulan</label>
            <label className="chk"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Tampilkan di situs</label>
            <button className="btn">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  )
}
