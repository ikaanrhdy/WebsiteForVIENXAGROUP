import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Card, SearchField, State } from '../ui.jsx'
import ProductCard from '../../components/ProductCard.jsx'

export default function ProdukSaya() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')

  const addToCart = async (product) => {
    await api.post('/me/cart/items', { product_id: product.id, quantity: 1 })
    window.dispatchEvent(new Event('vienxa:cart-updated'))
    return true
  }

  useEffect(() => {
    api.get('/products')
      .then((r) => setProducts(r.data || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <State loading error={''} />
  if (err) return <div className="alert">{err}</div>
  const filteredProducts = products.filter((product) => [
    product.name, product.description, product.category, product.unit,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  return (
    <>
      <h1 className="ptitle">Produk Unit Usaha</h1>
      {err && <div className="alert">{err}</div>}
      <Card title="Daftar Produk" action={<SearchField value={search} onChange={setSearch} placeholder="Cari produk..." />}>
        {products.length === 0 ? (
          <p className="muted">Belum ada produk yang tersedia.</p>
        ) : filteredProducts.length === 0 ? (
          <p className="muted">Tidak ada produk yang cocok dengan pencarian.</p>
        ) : (
          <div className="grid g3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </Card>
    </>
  )
}