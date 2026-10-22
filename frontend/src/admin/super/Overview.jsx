import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { Link } from 'react-router-dom'
import { rupiah } from '../../lib/api.js'
import { StatCard, Card, SearchField, State, OrdersTable } from '../ui.jsx'

export default function Overview() {
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useApi('/admin/dashboard')
  if (loading || error) return <State loading={loading} error={error} onRetry={reload} />
  const { stats, monthly, recent_orders } = data
  const filteredOrders = recent_orders.filter((order) => [
    order.code, order.project_name, order.user?.name, order.user?.email, order.package?.name, order.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))
  const max = Math.max(1, ...monthly.map((m) => m.count))

  return (
    <>
      <h1 className="ptitle">Dashboard</h1>
      <div className="dashboard-shortcuts">
        <Link className="btn sm" to="/admin/pesanan">Kelola pesanan</Link>
        <Link className="btn sm ghost" to="/admin/chat">Chat penjualan</Link>
        <Link className="btn sm ghost" to="/admin/produk">Kelola produk</Link>
      </div>
      <div className="stats">
        <StatCard color="blue" value={stats.users} label="Pembeli terdaftar" />
        <StatCard color="info" value={stats.orders} label="Total pesanan" />
        <StatCard color="warning" value={stats.pending} label="Menunggu konfirmasi" />
        <StatCard color="danger" value={rupiah(stats.revenue)} label="Nilai pesanan selesai" />
        <StatCard color="secondary" value={stats.news ?? 0} label="Berita" />
        <StatCard color="info" value={stats.products ?? 0} label="Produk unit usaha" />
      </div>

      <div className="two">
        <Card title="Pesanan 6 bulan terakhir">
          <div className="bars">
            {monthly.map((m) => (
              <div key={m.label} className="bar"><i style={{ height: `${(m.count / max) * 100}%` }} /><b>{m.count}</b><span>{m.label}</span></div>
            ))}
          </div>
        </Card>
        <Card title="Status pesanan">
          <ul className="kv">
            <li><span>Menunggu</span><b>{stats.pending}</b></li>
            <li><span>Diproses</span><b>{stats.processing}</b></li>
            <li><span>Selesai</span><b>{stats.done}</b></li>
            <li><span>Dibatalkan</span><b>{stats.cancelled}</b></li>
          </ul>
        </Card>
      </div>

      <Card title="Pesanan terbaru" action={<SearchField value={search} onChange={setSearch} placeholder="Cari pesanan..." />}>
        <OrdersTable orders={filteredOrders} showUser emptyText={search ? 'Tidak ada pesanan yang cocok dengan pencarian.' : 'Belum ada pesanan.'} />
      </Card>
    </>
  )
}
