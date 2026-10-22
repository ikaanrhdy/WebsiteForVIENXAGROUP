import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { units } from '../data.js'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SiteNav from '../components/SiteNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import LiveChat from '../components/LiveChat.jsx'

export default function ProductUnit() {
  const { slug } = useParams()
  const { user } = useAuth()
  const unit = units.find((item) => item.slug === slug)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.get(`/products?unit=${encodeURIComponent(slug)}`)
      .then((r) => { if (active) setProducts(r.data || []) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  if (!unit || slug === 'web-it') return <Navigate to={unit ? '/web-it' : '/'} replace />
  const featured = products.filter((product) => product.is_featured)
  const bestSellers = featured.length ? featured : products

  return (
    <>
      <SiteNav variant="home" />
      <LiveChat user={user} />
      <main>
        <section className="sec unit-hero">
          <p className="kicker">{unit.field} · Unit usaha VIENXA GROUP</p>
          <h1>VIENXA ({unit.name})</h1>
          <p className="lead">{unit.text} Temukan pilihan produk dan layanan unggulan kami.</p>
          <div className="actions">
            <a className="btn" href="#produk-unit">Lihat produk unggulan</a>
            <Link className="btn ghost" to="/#kontak">Hubungi kami</Link>
          </div>
        </section>
        <section id="produk-unit" className="sec alt">
          <div className="head">
            <h2>{featured.length ? 'Produk populer / best seller' : 'Produk dan layanan'}</h2>
            <p>Pilihan dari VIENXA ({unit.name}) yang dapat dipesan langsung melalui WhatsApp.</p>
          </div>
          {loading ? <p className="muted">Memuat produk…</p> : error ? <div className="alert">{error}</div> : bestSellers.length ? (
            <div className="grid g3">
              {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className="muted">Produk untuk unit ini belum tersedia. Silakan hubungi kami untuk informasi lebih lanjut.</p>
          )}
        </section>
        <section className="sec split">
          <div>
            <h2>Layanan {unit.name}</h2>
            <p>{unit.text} Kami siap membantu kebutuhan pelanggan dengan layanan yang terarah, kualitas terjaga, dan proses pemesanan yang mudah.</p>
          </div>
          <div className="panel">
            <h3>Pesan atau konsultasi</h3>
            <p>Hubungi tim kami untuk mengetahui ketersediaan, harga, atau kebutuhan khusus.</p>
            <Link className="btn sm" to="/#kontak">Hubungi VIENXA GROUP</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
