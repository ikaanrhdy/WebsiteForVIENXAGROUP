import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { services, packages as fallbackPackages, flow } from '../data.js'
import { api } from '../lib/api.js'
import { useAuth, homeFor } from '../context/AuthContext.jsx'
import SiteNav from '../components/SiteNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import LiveChat from '../components/LiveChat.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function WebIT() {
  const { user } = useAuth()
  const [packages, setPackages] = useState(fallbackPackages)
  const [products, setProducts] = useState([])

  // Paket diambil dari backend; jika backend mati, tampilkan data bawaan.
  useEffect(() => {
    api.get('/packages')
      .then((r) => r.data.length && setPackages(r.data.map((p) => ({ ...p, for: p.audience, items: p.features }))))
      .catch(() => {})

    api.get('/products?unit=web-it')
      .then((r) => setProducts(r.data || []))
      .catch(() => {})
  }, [])

  return (
    <>
      <SiteNav variant="webit" />
      <LiveChat user={user} />
      <main>
        <section className="sec page-hero">
          <p className="kicker">VIENXA (Web &amp; IT)</p>
          <h1>Website, aplikasi, dan produk IT untuk bisnis Anda.</h1>
          <p className="lead">Untuk UMKM, sekolah, organisasi, dan bisnis rintisan. Daftar sebagai pembeli, pilih paket, lalu pantau pesanan Anda dari dashboard.</p>
          <div className="actions">
            {user
              ? <Link className="btn" to={homeFor(user)}>Buka dashboard</Link>
              : <><Link className="btn" to="/login">Login</Link><Link className="btn ghost" to="/register">Daftar sebagai pembeli</Link></>}
          </div>
        </section>

        <section id="layanan" className="sec alt">
          <div className="head"><h2>Layanan</h2></div>
          <div className="grid g3">
            {services.map(([t, d]) => <article className="card" key={t}><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </section>

        <section id="paket" className="sec">
          <div className="head"><h2>Paket layanan</h2></div>
          <div className="grid g3">
            {packages.map((p) => (
              <article className={p.featured ? 'card pkg featured' : 'card pkg'} key={p.name}>
                <h3>{p.name}</h3>
                <p className="muted">{p.for}</p>
                <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link className="btn sm ghost" to={user ? '/dashboard/pesan' : '/register'}>Pesan paket ini</Link>
              </article>
            ))}
          </div>
          <p className="note">Pembayaran: uang muka 40%, pelunasan 60% saat serah terima. Garansi perbaikan 92 hari.</p>
        </section>

        <section id="alur" className="sec alt">
          <div className="head"><h2>Alur kerja</h2></div>
          <ol className="flow">{flow.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}</ol>
        </section>

        {products.length > 0 && (
        <section id="produk" className="sec alt">
          <div className="head">
            <h2>Produk Teknologi</h2>
            <p>Jual beli berbagai produk dan layanan teknologi dari VIENXA GROUP.</p>
          </div>
          <div className="grid g3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      </main>
      <SiteFooter />
    </>
  )
}
