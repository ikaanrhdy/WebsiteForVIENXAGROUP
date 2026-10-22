import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WA, contact, units, values } from '../data.js'
import { api } from '../lib/api.js'
import SiteNav from '../components/SiteNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import LiveChat from '../components/LiveChat.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Landing() {
  const [form, setForm] = useState({ nama: '', minat: units[6].name, pesan: '' })
  const [news, setNews] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [webItProducts, setWebItProducts] = useState([])
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const send = (e) => {
    e.preventDefault()
    const text = `Halo VIENXA GROUP, saya ${form.nama}. Saya tertarik dengan VIENXA (${form.minat}). ${form.pesan}`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  useEffect(() => {
    api.get('/news')
      .then((r) => setNews((r.data || []).slice(0, 3)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/products?featured=1')
      .then((r) => setFeaturedProducts(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/products?unit=web-it')
      .then((r) => setWebItProducts(r.data || []))
      .catch(() => {})
  }, [])

  const webItFeatured = webItProducts.filter((product) => product.is_featured)
  const webItBestSellers = (webItFeatured.length ? webItFeatured : webItProducts).slice(0, 3)

  return (
    <>
      <SiteNav variant="home" />
      <LiveChat user={null} />
      <main id="top">
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">Ekosistem usaha sejak Juni 2020</p>
            <h1>VIENXA GROUP, unit usaha yang berkesinambungan dan saling menguatkan.</h1>
            <p className="lead">VIENXA GROUP adalah ekosistem bisnis dinamis yang menaungi sektor kuliner, ritel, pemasaran, kreatif, dan teknologi. Melalui standarisasi mutu yang tinggi di setiap lini, kami berdedikasi penuh untuk mendorong kemajuan dan memberikan nilai terbaik bagi klien kami.</p>
            <div className="actions">
              <a className="btn" href="#unit">Lihat unit usaha</a>
              <a className="btn ghost" href="#kontak">Konsultasi gratis</a>
            </div>
          </div>
          <div className="logo-badge hero-logo">
            <img src="/vienxa-group-logo.jpeg" alt="Logo VIENXA GROUP" />
          </div>
        </section>

        <section className="strip">
          {[['2020', 'Berdiri'], ['7', 'Unit usaha'], ['5', 'Bidang layanan'], ['1', 'Merek bersama']].map(([n, l]) => (
            <div key={l}><b>{n}</b><span>{l}</span></div>
          ))}
        </section>

        <section id="tentang" className="sec split">
          <div>
            <h2>Tentang VIENXA GROUP</h2>
            <p>VIENXA GROUP didirikan oleh Ika Nur Hidayati, S.Kom. dan Kevin Setiawan, S.Kom., keduanya lulusan Sistem Informasi. Setiap unit punya identitas dan fokusnya sendiri, tetapi berada dalam satu merek dan satu ekosistem.</p>
            <p>Unit kuliner dan ritel menghasilkan produk. Unit periklanan, afiliasi, dan konten membantu memasarkannya. Unit Web & IT membangun website dan produk digital pendukungnya. Semua unit juga melayani klien dari luar grup.</p>
          </div>
          <div className="panel">
            <h3>Visi</h3>
            <p className="quote">Menjadi grup usaha lokal yang terpercaya dan tumbuh bersama, dengan ekosistem unit usaha yang saling mendukung serta memberi manfaat bagi pelanggan dan masyarakat sekitar.</p>
          </div>
        </section>

        <section id="unit" className="sec alt">
          <div className="head"><h2>Unit usaha</h2><p>Tujuh unit, satu standar pelayanan.</p></div>
          <div className="grid g4">
            {units.map((u) => (
              <article className="card" key={u.name}>
                <span className="tag">{u.field}</span>
                <h3>VIENXA <em>({u.name})</em></h3>
                <p>{u.text}</p>
                <Link className="more" to={u.slug === 'web-it' ? '/web-it' : `/unit/${u.slug}`}>Buka landing page →</Link>
              </article>
            ))}
            <article className="card cta">
              <h3>Butuh layanan lintas unit?</h3>
              <p>Katering, konten, iklan, dan website bisa dipesan dalam satu paket.</p>
              <a className="btn sm" href="#kontak">Diskusikan kebutuhan</a>
            </article>
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="sec">
            <div className="head">
              <h2>Produk populer / best seller</h2>
              <p>Pilihan unggulan dari berbagai unit usaha VIENXA GROUP.</p>
            </div>
            <div className="grid g3">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        <section className="sec split">
          <div>
            <h2>Mengapa memilih kami</h2>
            <p>Ekosistem yang saling mendukung membuat layanan lebih efisien dan konsisten bagi pelanggan.</p>
          </div>
          <ul className="why">
            <li><b>Produk, promosi, dan penjualan dalam satu grup.</b> Tidak perlu mengoordinasikan banyak vendor.</li>
            <li><b>Biaya pemasaran lebih efisien.</b> Promosi dikerjakan unit internal.</li>
            <li><b>Merek yang konsisten.</b> Kepercayaan pada satu unit ikut mendukung unit lain.</li>
            <li><b>Risiko usaha tersebar.</b> Grup tidak bergantung pada satu jenis bisnis.</li>
          </ul>
        </section>


        <section id="web-it" className="sec alt">
          <div className="head">
            <h2>VIENXA (Web &amp; IT)</h2>
            <p>Website, aplikasi, dan produk IT untuk UMKM, sekolah, organisasi, dan bisnis rintisan.</p>
          </div>
          {webItBestSellers.length > 0 && (
            <div className="webit-home-products">
              <h3>Produk Web &amp; IT populer</h3>
              <div className="grid g3">
                {webItBestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          )}
          <div className="actions">
            <Link className="btn" to="/web-it">Lihat layanan &amp; paket</Link>
            <Link className="btn ghost" to="/login">Login</Link>
          </div>
        </section>

        <section id="berita-terbaru" className="sec">
          <div className="head">
            <h2>Berita Terbaru</h2>
            <Link className="btn sm" to="/berita">Lihat semua berita →</Link>
          </div>
          <div className="grid g3">
            {news.length === 0 ? (
              <p className="muted" style={{ gridColumn: '1/-1', textAlign: 'center' }}>Belum ada berita.</p>
            ) : (
              news.map((n) => (
                <article key={n.id} className="card news-card">
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

        <section className="sec">
          <div className="head"><h2>Nilai perusahaan</h2></div>
          <div className="grid g5">
            {values.map(([t, d]) => <article className="val" key={t}><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </section>

        <section id="kontak" className="sec alt split">
          <div>
            <h2>Hubungi kami</h2>
            <p>Terbuka untuk kerja sama sebagai pelanggan, mitra usaha, maupun investor. Pesan Anda akan dikirim lewat WhatsApp.</p>
            <dl className="info">
              <dt>Telepon / WhatsApp</dt><dd><a href={`https://wa.me/${WA}`}>{contact.phone}</a></dd>
              <dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
              <dt>Instagram</dt><dd>{contact.instagram}</dd>
              <dt>Alamat</dt><dd>{contact.address}</dd>
            </dl>
          </div>
          <form className="panel form" onSubmit={send}>
            <label>Nama<input required value={form.nama} onChange={set('nama')} placeholder="Nama lengkap" /></label>
            <label>Layanan yang diminati
              <select value={form.minat} onChange={set('minat')}>{units.map((u) => <option key={u.name}>{u.name}</option>)}</select>
            </label>
            <label>Pesan<textarea rows="4" required value={form.pesan} onChange={set('pesan')} placeholder="Ceritakan kebutuhan Anda" /></label>
            <button className="btn" type="submit">Kirim lewat WhatsApp</button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
