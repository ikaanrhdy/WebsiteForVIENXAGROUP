import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api, rupiah } from '../../lib/api.js'
import { Card, State, Modal, SearchField } from '../ui.jsx'
import { productCategories, units } from '../../data.js'

const blank = { name: '', description: '', category: '', unit: 'daopurku-catering', price: '', stock: '', image: '', video_url: '', is_active: true, is_featured: false }

export default function ProductManager() {
  const { data, loading, error, reload } = useApi('/admin/products')
  const [form, setForm] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [err, setErr] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  const [search, setSearch] = useState('')

  const open = (p) => {
    setErr('')
    setImageFile(null)
    setForm(p ? { ...p, price: p.price ?? '', stock: p.stock ?? '' } : { ...blank, unit: unitFilter || blank.unit })
  }

  const save = async (e) => {
    e.preventDefault()
    const body = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      unit: form.unit,
      price: form.price === '' ? null : Number(form.price),
      stock: form.stock === '' ? 0 : Number(form.stock),
      image: form.image || null,
      video_url: form.video_url || null,
      is_active: !!form.is_active,
      is_featured: !!form.is_featured,
    }
    try {
      let image = form.image || null
      if (imageFile) {
        const upload = new FormData()
        upload.append('image', imageFile)
        upload.append('folder', 'products')
        image = (await api.post('/admin/upload/image', upload)).path
      }

      body.image = image
      await (form.id ? api.put(`/admin/products/${form.id}`, body) : api.post('/admin/products', body))
      setForm(null); reload()
    } catch (e2) { setErr(e2.message) }
  }

  const remove = async (p) => {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return
    try { await api.del(`/admin/products/${p.id}`); reload() } catch (e2) { setErr(e2.message) }
  }
  const filteredProducts = (data?.data || []).filter((product) => {
    const matchesUnit = !unitFilter || product.unit === unitFilter
    const matchesSearch = [
      product.name, product.description, product.category, product.unit, product.video_url,
    ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID')))
    return matchesUnit && matchesSearch
  })

  return (
    <>
      <h1 className="ptitle">Manajemen Produk Unit Usaha</h1>
      {err && !form && <div className="alert">{err}</div>}
      <Card title="Daftar Produk" action={<div className="product-admin-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari produk..." />
        <select aria-label="Filter unit usaha" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
          <option value="">Semua unit usaha</option>
          {units.map((unit) => <option key={unit.slug} value={unit.slug}>{unit.name}</option>)}
        </select>
        <button className="btn sm" onClick={() => open(null)}>+ Tambah produk</button>
      </div>}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Unit usaha</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Media</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filteredProducts.length === 0 && <tr><td colSpan={8} className="muted">{search || unitFilter ? 'Tidak ada produk yang cocok dengan pencarian atau filter.' : 'Belum ada produk.'}</td></tr>}
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b>{p.is_featured && <span className="badge info">Unggulan</span>}</td>
                    <td>{units.find((unit) => unit.slug === p.unit)?.name || p.unit || 'Web & IT'}</td>
                    <td>{p.category || '-'}</td>
                    <td>{rupiah(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="admin-media-thumb" />
                      ) : p.video_url ? <a className="lnk" href={p.video_url} target="_blank" rel="noreferrer">Video</a> : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td><span className={`badge ${p.is_active ? 'success' : 'secondary'}`}>{p.is_active ? 'Aktif' : 'Tidak aktif'}</span></td>
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
        <Modal title={form.id ? 'Ubah produk' : 'Tambah produk'} onClose={() => setForm(null)}>
          <form className="form" onSubmit={save}>
            {err && <div className="alert">{err}</div>}
            <label>Nama produk<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Unit usaha
              <select required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value, category: '' })}>
                {units.map((unit) => <option key={unit.slug} value={unit.slug}>{unit.name}</option>)}
              </select>
            </label>
            <label>Kategori produk
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Pilih kategori</option>
                {form.category && !(productCategories[form.unit] || []).includes(form.category) && <option>{form.category}</option>}
                {(productCategories[form.unit] || []).map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Deskripsi<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Harga (Rp)<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>Stok<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
            <label>{form.unit === 'content-creator' ? 'Foto pendukung (opsional)' : 'Gambar produk'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => {
                const file = e.target.files?.[0] || null
                if (file && file.size > 2 * 1024 * 1024) {
                  setErr('Ukuran gambar maksimal 2 MB.')
                  setImageFile(null)
                  e.target.value = ''
                  return
                }
                setErr('')
                setImageFile(file)
              }} />
              <small className="muted">JPG, PNG, WebP, atau GIF; maksimal 2 MB.</small>
            </label>
            {imageFile && <p className="muted">Gambar dipilih: {imageFile.name}</p>}
            {!imageFile && form.image && <img src={form.image} alt="Gambar produk saat ini" className="admin-media-preview" />}
            {form.unit === 'content-creator' && (
              <label>Link video
                <input type="url" placeholder="https://..." value={form.video_url || ''} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
                <small className="muted">Masukkan tautan video; foto produk dapat ditambahkan di kolom foto.</small>
              </label>
            )}
            <label className="chk"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Aktifkan di situs</label>
            <label className="chk"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Tandai unggulan</label>
            <button className="btn">{form.id ? 'Perbarui' : 'Simpan produk'}</button>
          </form>
        </Modal>
      )}
    </>
  )
}