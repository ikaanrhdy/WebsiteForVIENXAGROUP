import { useState } from 'react'
import { api, rupiah } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { WA } from '../data.js'
import { units } from '../data.js'
import ProductDetails from './ProductDetails.jsx'
import { addGuestCartItem } from '../lib/guestCart.js'

export default function ProductCard({ product, onAddToCart }) {
  const { user } = useAuth()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [adding, setAdding] = useState(false)
  const unit = units.find((item) => item.slug === product.unit)
  const orderText = `Halo VIENXA (${unit?.name || 'GROUP'}), saya tertarik dengan produk ${product.name}.`
  const addToCart = async () => {
    setCartError('')
    setCartMessage('')
    setAdding(true)
    try {
      if (onAddToCart) {
        const succeeded = await onAddToCart(product)
        if (succeeded === false) return
      } else if (user?.role === 'user') {
        await api.post('/me/cart/items', { product_id: product.id, quantity: 1 })
        window.dispatchEvent(new Event('vienxa:cart-updated'))
      } else {
        addGuestCartItem(product)
      }
      setCartMessage(`${product.name} ditambahkan ke keranjang.`)
    } catch (error) {
      setCartError(error.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="card pkg product-card">
      <button type="button" className="product-image-button" aria-label={`Lihat detail ${product.name}`} onClick={() => setDetailsOpen(true)}>
        {product.image ? <img src={product.image} alt="" className="news-img product-img" /> : <span className="product-image-placeholder">VIENXA</span>}
      </button>
      {product.video_url && (
        <a className="product-video" href={product.video_url} target="_blank" rel="noreferrer">▶ Lihat video produk</a>
      )}
      <div className="product-card-content">
        {product.is_featured && <span className="tag product-tag">Best seller</span>}
        <h3><button type="button" className="product-title-button" onClick={() => setDetailsOpen(true)}>{product.name}</button></h3>
        <p className="muted">{product.category || unit?.name || 'Produk'}</p>
        <div className="product-card-rating">
          <span aria-label={`Rating ${Number(product.rating || 0).toFixed(1)} dari 5`}>★ {Number(product.rating || 0).toFixed(1)}</span>
          <span>{product.reviews_count || 0} ulasan</span>
          <span>{product.sold_count || 0} terjual</span>
        </div>
        <div className="product-card-bottom">
          <strong>{product.price != null ? rupiah(product.price) : 'Hubungi kami'}</strong>
          <span className="muted">Stok: {product.stock}</span>
        </div>
        <div className="product-card-actions">
          <button type="button" className="btn sm ghost" onClick={() => setDetailsOpen(true)}>Detail</button>
          {(!user || user.role === 'user') && (
            <button className="btn sm" type="button" disabled={adding || product.stock === 0} onClick={addToCart}>
              {adding ? 'Menambahkan…' : '+ Keranjang'}
            </button>
          )}
          <a className="product-card-whatsapp" href={`https://wa.me/${WA}?text=${encodeURIComponent(orderText)}`} target="_blank" rel="noreferrer" aria-label={`Pesan ${product.name} melalui WhatsApp`}>WA</a>
        </div>
        {cartMessage && <p className="product-card-feedback">{cartMessage}</p>}
        {cartError && <p className="product-card-feedback error">{cartError}</p>}
      </div>
      {detailsOpen && <ProductDetails product={product} onClose={() => setDetailsOpen(false)} onAddToCart={addToCart} cartMessage={cartMessage} cartError={cartError} adding={adding} />}
    </article>
  )
}
