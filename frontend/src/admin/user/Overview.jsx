import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../lib/useApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { StatCard, Card, SearchField, State, OrdersTable } from '../ui.jsx'

export default function Overview() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi('/me/dashboard')
  if (loading || error) return <State loading={loading} error={error} onRetry={reload} />
  const { stats, recent_orders } = data
  const filteredOrders = recent_orders.filter((order) => [
    order.code, order.project_name, order.package?.name, order.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  return (
    <>
      <h1 className="ptitle">Halo, {user.name.split(' ')[0]}</h1>
      <div className="dashboard-shortcuts">
        <Link className="btn sm" to="/dashboard/produk">Jelajahi produk</Link>
        <Link className="btn sm ghost" to="/dashboard/keranjang">Keranjang</Link>
        <Link className="btn sm ghost" to="/dashboard/chat">Chat penjualan</Link>
      </div>
      <div className="stats">
        <StatCard color="blue" value={stats.total} label="Total pesanan" />
        <StatCard color="warning" value={stats.pending} label="Menunggu konfirmasi" />
        <StatCard color="info" value={stats.processing} label="Sedang diproses" />
        <StatCard color="success" value={stats.done} label="Selesai" />
      </div>
      <Card title="Pesanan terbaru" action={<div className="card-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan..." />
        <Link className="btn sm" to="/dashboard/pesan">+ Pesan paket</Link>
      </div>}>
        <OrdersTable orders={filteredOrders} emptyText={search ? 'Tidak ada pesanan yang cocok dengan pencarian.' : 'Belum ada pesanan.'} />
      </Card>
    </>
  )
}
