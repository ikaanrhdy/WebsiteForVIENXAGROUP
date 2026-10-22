import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import SiteNav from '../components/SiteNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

export default function Berita() {
  const [news, setNews] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get('/news')
      .then((r) => {
        if (!Array.isArray(r?.data)) {
          throw new Error('Format respons berita dari server tidak valid.')
        }
        setNews(r.data)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  const openDetail = (n) => { setSelected(n) }

  return (
    <>
      <SiteNav variant="home" />
      <main>
        <section className="sec page-hero">
          <h1>Berita &amp; Update Terbaru</h1>
          <p className="lead">Baca informasi terbaru mengenai layanan, produk, dan kegiatan VIENXA GROUP.</p>
        </section>

        {err && <div className="alert" style={{ maxWidth: '1180px', margin: '0 auto 2rem' }}>{err}</div>}

        <section className="sec">
          <div className="head" style={{ maxWidth: '1180px', margin: '0 auto 2rem' }}>
            <h2>Semua Berita</h2>
          </div>
          <div className="grid g3" style={{ maxWidth: '1180px', margin: '0 auto' }}>
            {loading ? (
              <p className="muted" style={{ gridColumn: '1/-1', textAlign: 'center' }}>Memuat berita…</p>
            ) : news.length === 0 ? (
              <p className="muted" style={{ gridColumn: '1/-1', textAlign: 'center' }}>Belum ada berita.</p>
            ) : (
              news.map((n) => (
                <article key={n.id} className="card news-card" onClick={() => openDetail(n)}>
                  {n.image && <img src={n.image} alt={n.title} className="news-img" />}
                  <div className="news-body">
                    <span className="news-date">{new Date(n.published_at || n.created_at).toLocaleDateString('id-ID')}</span>
                    <h3>{n.title}</h3>
                    <p className="muted news-excerpt">{n.excerpt || '-'}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {selected && (
        <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: '700px' }}>
            <header>
              <h3>{selected.title}</h3>
              <button className="x" onClick={() => setSelected(null)}>×</button>
            </header>
            <div className="modal-body" style={{ padding: '1.2rem' }}>
              {selected.image && <img src={selected.image} alt={selected.title} className="news-detail-img news-square" />}
              <p className="muted" style={{ fontSize: '.9rem', marginBottom: '.5rem' }}>
                {new Date(selected.published_at || selected.created_at).toLocaleDateString('id-ID')} ·
                {selected.author?.name || 'VIENXA GROUP'}
              </p>
              <div className="desc" style={{ whiteSpace: 'pre-wrap' }}>{selected.content || '-'}</div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  )
}