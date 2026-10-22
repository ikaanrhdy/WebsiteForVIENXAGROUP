import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext.jsx'
import { units } from '../data.js'
import BrandMark from './BrandMark.jsx'
import { CartIcon } from './icons.jsx'
import { guestCartCount } from '../lib/guestCart.js'
import { api } from '../lib/api.js'

// variant "home"  : menu halaman utama
// variant "webit" : menu halaman Web & IT (ada tombol Login)
export default function SiteNav({ variant = 'home' }) {
  const [open, setOpen] = useState(false)
  const [unitOpen, setUnitOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { user } = useAuth()
  const close = () => { setOpen(false); setUnitOpen(false) }
  const cartPath = '/keranjang'

  useEffect(() => {
    const loadCount = async () => {
      if (user?.role === 'user') {
        try {
          const response = await api.get('/me/cart')
          setCartCount((response.data || []).reduce((count, item) => count + item.quantity, 0))
        } catch (error) {
          console.error('Gagal memuat jumlah keranjang:', error)
        }
      } else {
        setCartCount(guestCartCount())
      }
    }
    loadCount()
    window.addEventListener('vienxa:cart-updated', loadCount)
    return () => window.removeEventListener('vienxa:cart-updated', loadCount)
  }, [user?.role])

  return (
    <header className="nav">
      <Link to="/" className="brand" aria-label="VIENXA GROUP">
        <BrandMark />
      </Link>

      <nav className={open ? 'menu open' : 'menu'}>
        {variant === 'home' ? (
          <>
            <Link to="/#tentang" onClick={close}>Tentang</Link>
          </>
        ) : (
          <>
            <Link to="/" onClick={close}>Beranda</Link>
          </>
        )}
        <div className={unitOpen ? 'nav-dropdown open' : 'nav-dropdown'}>
          <button type="button" aria-expanded={unitOpen} onClick={() => setUnitOpen(!unitOpen)}>Unit Usaha <span aria-hidden="true">⌄</span></button>
          <div className="unit-menu">
            {units.map((unit) => (
              <Link key={unit.slug} to={unit.slug === 'web-it' ? '/web-it' : `/unit/${unit.slug}`} onClick={close}>
                {unit.name}
              </Link>
            ))}
          </div>
        </div>
        {variant === 'home' ? (
          <>
            <Link to="/#kontak" onClick={close}>Kontak</Link>
            <Link className="btn sm" to="/#kontak" onClick={close}>Hubungi kami</Link>
          </>
        ) : (
          <>
            <Link to="/web-it#layanan" onClick={close}>Layanan</Link>
            <Link to="/web-it#paket" onClick={close}>Paket</Link>
            <Link to="/web-it#alur" onClick={close}>Alur Kerja</Link>
            {user ? (
              <Link className="btn sm" to={homeFor(user)} onClick={close}>Dashboard</Link>
            ) : (
              <Link className="btn sm" to="/login" onClick={close}>Login</Link>
            )}
          </>
        )}
      </nav>
      {user?.role !== 'super_admin' && (
        <Link className="site-cart-link" to={cartPath} aria-label={`Keranjang, ${cartCount} item`} onClick={close}>
          <CartIcon />
          <span>Keranjang</span>
          {cartCount > 0 && <b>{cartCount}</b>}
        </Link>
      )}
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /><i /></button>
    </header>
  )
}
