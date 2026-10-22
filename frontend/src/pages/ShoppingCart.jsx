import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, rupiah } from '../lib/api.js'
import { guestCartCount, readGuestCart, writeGuestCart } from '../lib/guestCart.js'
import SiteNav from '../components/SiteNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

export default function ShoppingCart() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const buyer = user?.role === 'user'

  const load = useCallback(async () => {
    setError('')
    try {
      if (buyer) {
        const guestItems = readGuestCart()
        for (const item of guestItems) {
          await api.post('/me/cart/items', { product_id: item.product.id, quantity: item.quantity })
          writeGuestCart(readGuestCart().filter((guestItem) => guestItem.product.id !== item.product.id))
        }
        const response = await api.get('/me/cart')
        setItems(response.data || [])
      } else {
        setItems(readGuestCart())
      }
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [buyer])

  useEffect(() => { load() }, [load])

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return
    setError('')
    try {
      if (buyer) {
        await api.put(`/me/cart/items/${item.id}`, { quantity })
        await load()
      } else {
        writeGuestCart(items.map((entry) => (
          entry.product.id === item.product.id ? { ...entry, quantity } : entry
        )))
        setItems(readGuestCart())
      }
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const removeItem = async (item) => {
    setError('')
    try {
      if (buyer) {
        await api.del(`/me/cart/items/${item.id}`)
        await load()
      } else {
        writeGuestCart(items.filter((entry) => entry.product.id !== item.product.id))
        setItems(readGuestCart())
      }
    } catch (removeError) {
      setError(removeError.message)
    }
  }

  const total = items.every((item) => item.product.price != null)
    ? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : null

  return (
    <>
      <SiteNav variant="home" />
      <main className="sec public-cart">
        <h1>Keranjang belanja</h1>
        <p className="lead">Tinjau produk pilihan Anda sebelum membuat pesanan.</p>
        {error && <div className="alert">{error}</div>}
        <section className="panel public-cart-panel">
          <h2>Produk pilihan Anda</h2>
          {loading ? <p className="muted">Memuat keranjang…</p> : items.length ? (
            <>
              <div className="public-cart-list">
                {items.map((item) => (
                  <article className="public-cart-item" key={item.id || item.product.id}>
                    {!buyer && item.product.image && <img src={item.product.image} alt="" />}
                    <div className="public-cart-product">
                      <h3>{item.product.name}</h3>
                      <p className="muted">{item.product.category || item.product.unit}</p>
                      <strong>{item.product.price == null ? 'Harga sesuai penawaran' : rupiah(item.product.price)}</strong>
                    </div>
                    <div className="cart-quantity">
                      <button type="button" aria-label="Kurangi jumlah" disabled={item.quantity <= 1} onClick={() => updateQuantity(item, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label="Tambah jumlah" disabled={item.product.stock != null && item.quantity >= item.product.stock} onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn sm ghost" type="button" onClick={() => removeItem(item)}>Hapus</button>
                  </article>
                ))}
              </div>
              <div className="public-cart-total">
                <strong>Total {total == null ? 'menunggu konfirmasi harga' : rupiah(total)}</strong>
                {buyer
                  ? <Link className="btn" to="/dashboard/keranjang">Lanjut ke checkout</Link>
                  : <Link className="btn" to="/login" state={{ from: '/keranjang' }}>Login untuk checkout</Link>}
              </div>
            </>
          ) : (
            <div className="public-cart-empty">
              <p className="muted">Keranjang Anda masih kosong.</p>
              <Link className="btn sm" to="/unit/daopurku-catering">Jelajahi produk</Link>
            </div>
          )}
          <small className="muted">Jumlah item di keranjang: {buyer ? items.reduce((count, item) => count + item.quantity, 0) : guestCartCount()}</small>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
