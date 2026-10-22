import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api } from '../../lib/api.js'
import { Card, State, Modal, SearchField } from '../ui.jsx'

const blank = { title: '', excerpt: '', content: '', image: '', is_published: true }

export default function NewsManager() {
  const { data, loading, error, reload } = useApi('/admin/news')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [err, setErr] = useState('')
  const filteredNews = (data?.data || []).filter((news) => [
    news.title, news.excerpt, news.content, news.is_published ? 'diterbitkan' : 'draft',
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const open = (n) => {
    setErr('')
    setImageFile(null)
    setForm(n ? { ...n } : { ...blank })
  }

  const save = async (e) => {
    e.preventDefault()
    const body = {
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content || null,
      image: form.image || null,
      is_published: !!form.is_published,
    }
    try {
      let image = form.image || null
      if (imageFile) {
        const upload = new FormData()
        upload.append('image', imageFile)
        upload.append('folder', 'news')
        image = (await api.post('/admin/upload/image', upload)).path
      }

      body.image = image
      await (form.id ? api.put(`/admin/news/${form.id}`, body) : api.post('/admin/news', body))
      setForm(null); reload()
    } catch (e2) { setErr(e2.message) }
  }

  const remove = async (n) => {
    if (!window.confirm(`Hapus berita "${n.title}"?`)) return
    try { await api.del(`/admin/news/${n.id}`); reload() } catch (e2) { setErr(e2.message) }
  }

  return (
    <>
      <h1 className="ptitle">Manajemen Berita</h1>
      {err && !form && <div className="alert">{err}</div>}
      <Card title="Daftar Berita" action={<div className="card-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari berita..." />
        <button className="btn sm" onClick={() => open(null)}>+ Tambah berita</button>
      </div>}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Judul</th><th>Ringkasan</th><th>Gambar</th><th>Status</th><th>Tanggal</th><th /></tr></thead>
              <tbody>
                {filteredNews.length === 0 && <tr><td colSpan={6} className="muted">{search ? 'Tidak ada berita yang cocok dengan pencarian.' : 'Belum ada berita.'}</td></tr>}
                {filteredNews.map((n) => (
                  <tr key={n.id}>
                    <td><b>{n.title}</b></td>
                    <td className="muted" style={{ maxWidth: '260px' }}>{n.excerpt || '-'}</td>
                    <td>
                      {n.image ? (
                        <img src={n.image} alt={n.title} className="admin-media-thumb" />
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td><span className={`badge ${n.is_published ? 'success' : 'secondary'}`}>{n.is_published ? 'Diterbitkan' : 'Draft'}</span></td>
                    <td>{new Date(n.published_at || n.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="right">
                      <button className="btn sm ghost" onClick={() => open(n)}>Ubah</button>{' '}
                      <button className="btn sm danger" onClick={() => remove(n)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? 'Ubah berita' : 'Tambah berita'} onClose={() => setForm(null)}>
          <form className="form" onSubmit={save}>
            {err && <div className="alert">{err}</div>}
            <label>Judul berita<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Ringkasan (excerpt)<textarea rows="2" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
            <label>Isi berita (HTML)<textarea rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
            <label>Gambar berita
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
            {!imageFile && form.image && <img src={form.image} alt="Gambar berita saat ini" className="admin-media-preview" />}
            <label className="chk"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Terbitkan segera</label>
            <button className="btn">{form.id ? 'Perbarui' : 'Simpan berita'}</button>
          </form>
        </Modal>
      )}
    </>
  )
}