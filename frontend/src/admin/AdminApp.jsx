import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import Overview from './super/Overview.jsx'
import Users from './super/Users.jsx'
import Orders from './super/Orders.jsx'
import Packages from './super/Packages.jsx'
import NewsManager from './super/NewsManager.jsx'
import ProductManager from './super/ProductManager.jsx'
import Profile from './user/Profile.jsx'
import SalesChat from './SalesChat.jsx'
import ProcurementConfirmations from './super/ProcurementConfirmations.jsx'
import ProcurementDocuments from './super/ProcurementDocuments.jsx'

const menu = [
  { items: [{ to: '/admin', end: true, icon: '◧', label: 'Dashboard' }] },
  { group: 'Manajemen', items: [
    { to: '/admin/pengadaan', icon: '▤', label: 'Konfirmasi Pengadaan' },
    { to: '/admin/pesanan', icon: '☰', label: 'Pesanan' },
    { to: '/admin/pengguna', icon: '☺', label: 'Pengguna' },
    { to: '/admin/paket', icon: '▣', label: 'Paket Layanan' },
    { to: '/admin/berita', icon: '📰', label: 'Berita' },
    { to: '/admin/produk', icon: '🛍', label: 'Produk Unit Usaha' },
    { to: '/admin/profil', icon: '☺', label: 'Profil' },
    { to: '/admin/chat', icon: '◉', label: 'Chat penjualan' },
  ] },
]

export default function AdminApp() {
  return (
    <Layout menu={menu} roleLabel="Dashboard Super Admin">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="pesanan" element={<Orders />} />
        <Route path="pengadaan" element={<ProcurementConfirmations />} />
        <Route path="pengadaan/:id/dokumen" element={<ProcurementDocuments />} />
        <Route path="pengguna" element={<Users />} />
        <Route path="paket" element={<Packages />} />
        <Route path="berita" element={<NewsManager />} />
        <Route path="produk" element={<ProductManager />} />
        <Route path="profil" element={<Profile />} />
        <Route path="chat" element={<SalesChat admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  )
}
