import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, rupiah } from '../../lib/api.js'
import { Card, SearchField, State } from '../ui.jsx'

export default function Cart() {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const response = await api.get('/me/cart')
      setItems(response.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return
    try {
      await api.put(`/me/cart/items/${item.id}`, { quantity })
      await load()
      window.dispatchEvent(new Event('vienxa:cart-updated'))
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (item) => {
    try {
      await api.del(`/me/cart/items/${item.id}`)
      await load()
      window.dispatchEvent(new Event('vienxa:cart-updated'))
    } catch (e) {
      setError(e.message)
    }
  }

  const checkout = async () => {
    setBusy(true)
    setError('')
    try {
      const response = await api.post('/me/cart/checkout')
      setNotice(`Pesanan ${response.data.code} berhasil dibuat.`)
      window.dispatchEvent(new Event('vienxa:cart-updated'))
      nav('/dashboard/pesanan', { state: { message: `Pesanan ${response.data.code} berhasil dibuat.` } })
    } catch (e) {
      setError(e.message)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const total = items.every((item) => item.line_total != null)
    ? items.reduce((sum, item) => sum + item.line_total, 0)
    : null
  const filteredItems = items.filter((item) => [
    item.product?.name, item.product?.category, item.product?.unit,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  return (
    <>
      <h1 className="ptitle">Keranjang belanja</h1>
      {error && <div className="alert">{error}</div>}
      {notice && <div className="alert ok">{notice}</div>}
      <Card title="Produk pilihan Anda" action={<SearchField value={search} onChange={setSearch} placeholder="Cari produk di keranjang..." />}>
        <State loading={loading} />
        {!loading && (items.length ? (
          <>
            <div className="cart-list">
              {filteredItems.length === 0 && <p className="muted">Tidak ada produk di keranjang yang cocok dengan pencarian.</p>}
              {filteredItems.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div>
                    <h3>{item.product.name}</h3>
                    <p className="muted">{item.product.category || item.product.unit} · {item.product.price == null ? 'Harga sesuai penawaran' : rupiah(item.product.price)}</p>
                  </div>
                  <div className="cart-quantity">
                    <button type="button" aria-label="Kurangi jumlah" onClick={() => updateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label="Tambah jumlah" onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                  </div>
                  <strong>{item.line_total == null ? 'Hubungi admin' : rupiah(item.line_total)}</strong>
                  <button className="btn sm danger" type="button" onClick={() => remove(item)}>Hapus</button>
                </article>
              ))}
            </div>
            <div className="cart-checkout">
              <p>Total sementara <strong>{total == null ? 'Menunggu konfirmasi harga' : rupiah(total)}</strong></p>
              <button className="btn" type="button" disabled={busy} onClick={checkout}>
                {busy ? 'Memproses…' : 'Buat pesanan'}
              </button>
            </div>
          </>
        ) : <p className="muted">Keranjang masih kosong. Tambahkan produk dari menu Produk Saya.</p>)}
      </Card>
    </>
  )
}
