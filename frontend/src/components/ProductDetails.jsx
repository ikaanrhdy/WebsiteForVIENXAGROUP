import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, rupiah } from '../lib/api.js'
import { WA, units } from '../data.js'

function Stars({ value }) {
  const rounded = Math.round(Number(value) || 0)
  return (
    <span className="product-stars" aria-label={`${Number(value || 0).toFixed(1)} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= rounded ? 'filled' : ''}>★</span>)}
    </span>
  )
}

export default function ProductDetails({ product, onClose, onAddToCart, cartMessage, cartError, adding }) {
  const { user } = useAuth()
  const [details, setDetails] = useState(product)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const unit = units.find((item) => item.slug === product.unit)
  const whatsappMessage = `Halo VIENXA (${unit?.name || 'GROUP'}), saya ingin bertanya tentang ${product.name}.`
  const chatPath = user?.role === 'user' ? '/dashboard/chat' : '/login'

  const loadDetails = async () => {
    setError('')
    try {
      const response = await api.get(`/products/${product.id}`)
      setDetails(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [product.id])

  const submitReview = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setReviewMessage('')
    try {
      await api.post(`/me/products/${product.id}/reviews`, { rating, review })
      setReviewMessage('Terima kasih, ulasan Anda berhasil disimpan.')
      setReview('')
      await loadDetails()
    } catch (requestError) {
      setReviewMessage(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="product-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <header className="product-detail-header">
          <h2 id="product-detail-title">Detail produk</h2>
          <button type="button" className="product-detail-close" aria-label="Tutup detail produk" onClick={onClose}>×</button>
        </header>
        <div className="product-detail-body">
          <div className="product-detail-main">
            {details.image && <img className="product-detail-image" src={details.image} alt={details.name} />}
            {details.video_url && <a className="product-video" href={details.video_url} target="_blank" rel="noreferrer">▶ Lihat video produk</a>}
            <div className="product-detail-summary">
              <span className="tag">{details.category || unit?.name || 'Produk'}</span>
              <h3>{details.name}</h3>
              <strong className="product-detail-price">{details.price != null ? rupiah(details.price) : 'Hubungi kami'}</strong>
              <div className="product-rating-summary">
                <Stars value={details.rating} />
                <b>{Number(details.rating || 0).toFixed(1)}</b>
                <span>{details.reviews_count || 0} ulasan</span>
                <span>{details.sold_count || 0} terjual</span>
              </div>
              <p className="product-detail-description">{details.description || 'Belum ada deskripsi produk.'}</p>
              <p className="muted">Stok tersedia: {details.stock}</p>
              <div className="product-detail-actions">
                {user?.role === 'user'
                  ? <button type="button" className="btn sm" disabled={adding} onClick={() => onAddToCart(product)}>{adding ? 'Menambahkan…' : '+ Keranjang'}</button>
                  : !user && <Link className="btn sm" to="/login" onClick={onClose}>Login untuk keranjang</Link>}
                <Link className="btn sm ghost" to={chatPath} onClick={onClose}>Chat penjual</Link>
                <a className="btn sm whatsapp-button" href={`https://wa.me/${WA}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
              {cartMessage && <p className="alert ok product-feedback">{cartMessage}</p>}
              {cartError && <p className="alert product-feedback">{cartError}</p>}
            </div>
          </div>

          <section className="product-reviews">
            <div className="product-reviews-heading">
              <h3>Rating &amp; ulasan</h3>
              <span><Stars value={details.rating} /> {Number(details.rating || 0).toFixed(1)} · {details.reviews_count || 0} ulasan</span>
            </div>
            {loading ? <p className="muted">Memuat ulasan…</p> : error ? <p className="alert">{error}</p> : details.reviews?.length ? (
              <div className="product-review-list">
                {details.reviews.map((item) => (
                  <article className="product-review" key={item.id}>
                    <div><b>{item.user?.name || 'Pembeli'}</b><Stars value={item.rating} /></div>
                    <small>{new Date(item.created_at).toLocaleDateString('id-ID')}</small>
                    {item.review && <p>{item.review}</p>}
                  </article>
                ))}
              </div>
            ) : <p className="muted">Belum ada ulasan untuk produk ini.</p>}

            {user?.role === 'user' ? (
              <form className="product-review-form" onSubmit={submitReview}>
                <label htmlFor="product-rating">Rating Anda</label>
                <select id="product-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} bintang</option>)}
                </select>
                <label htmlFor="product-review">Ulasan</label>
                <textarea id="product-review" rows="3" maxLength="2000" value={review} onChange={(event) => setReview(event.target.value)} placeholder="Ceritakan pengalaman Anda setelah pesanan selesai." />
                <button className="btn sm" type="submit" disabled={submitting}>{submitting ? 'Menyimpan…' : 'Kirim ulasan'}</button>
                <small className="muted">Ulasan hanya dapat dikirim oleh pembeli dengan pesanan produk yang sudah selesai.</small>
                {reviewMessage && <p className={reviewMessage.startsWith('Terima kasih') ? 'alert ok' : 'alert'}>{reviewMessage}</p>}
              </form>
            ) : (
              <p className="muted"><Link className="lnk" to="/login" onClick={onClose}>Login</Link> sebagai pembeli untuk menulis ulasan.</p>
            )}
          </section>
        </div>
      </section>
    </div>,
    document.body
  )
}
