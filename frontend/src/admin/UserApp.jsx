import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import Overview from './user/Overview.jsx'
import NewOrder from './user/NewOrder.jsx'
import MyOrders from './user/MyOrders.jsx'
import Profile from './user/Profile.jsx'
import ProdukSaya from './user/ProdukSaya.jsx'
import Cart from './user/Cart.jsx'
import SalesChat from './SalesChat.jsx'
import Procurement from './user/Procurement.jsx'

const menu = [
  { items: [{ to: '/dashboard', end: true, icon: '◧', label: 'Dashboard' }] },
  { group: 'Pembelian', items: [
    { to: '/dashboard/pengadaan', icon: '▤', label: 'Pengajuan Pengadaan' },
    { to: '/dashboard/pesan', icon: '＋', label: 'Pesan Paket' },
    { to: '/dashboard/pesanan', icon: '☰', label: 'Pesanan Saya' },
    { to: '/dashboard/produk', icon: '🛍', label: 'Produk Saya' },
    { to: '/dashboard/keranjang', icon: '▣', label: 'Keranjang' },
    { to: '/dashboard/chat', icon: '◉', label: 'Chat penjualan' },
  ] },
  { group: 'Akun', items: [{ to: '/dashboard/profil', icon: '☺', label: 'Profil' }] },
]

export default function UserApp() {
  return (
    <Layout menu={menu} roleLabel="Dashboard Pembeli">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="pesan" element={<NewOrder />} />
        <Route path="pesanan" element={<MyOrders />} />
        <Route path="pengadaan" element={<Procurement />} />
        <Route path="produk" element={<ProdukSaya />} />
        <Route path="keranjang" element={<Cart />} />
        <Route path="chat" element={<SalesChat />} />
        <Route path="profil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
