import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api } from '../../lib/api.js'
import { Card, State, Modal, OrdersTable, SearchField } from '../ui.jsx'

export default function MyOrders() {
  const { data, loading, error, reload } = useApi('/me/orders')
  const [search, setSearch] = useState('')
  const [view, setView] = useState(null)
  const [err, setErr] = useState('')
  const filteredOrders = (data?.data || []).filter((order) => [
    order.code, order.project_name, order.description, order.package?.name, order.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const cancel = async (o) => {
    if (!window.confirm(`Batalkan pesanan ${o.code}?`)) return
    try { await api.post(`/me/orders/${o.id}/cancel`); setView(null); reload() } catch (e) { setErr(e.message) }
  }

  return (
    <>
      <h1 className="ptitle">Pesanan saya</h1>
      {err && <div className="alert">{err}</div>}
      <Card title="Riwayat pesanan" action={<SearchField value={search} onChange={setSearch} placeholder="Cari pesanan..." />}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && <OrdersTable orders={filteredOrders} emptyText={search ? 'Tidak ada pesanan yang cocok dengan pencarian.' : 'Belum ada pesanan.'} actions={(o) => <button className="btn sm ghost" onClick={() => setView(o)}>Detail</button>} />}
      </Card>
      {view && (
        <Modal title={`Pesanan ${view.code}`} onClose={() => setView(null)}>
          <div className="form">
            <p><b>{view.project_name}</b><br /><span className="muted">{view.package?.name}</span></p>
            <p className="desc">{view.description}</p>
            {view.items?.length > 0 && (
              <div className="order-items">
                <b>Produk pesanan</b>
                {view.items.map((item) => (
                  <p key={item.id}>{item.product_name} × {item.quantity}</p>
                ))}
              </div>
            )}
            {view.admin_notes && <div className="note-box"><b>Catatan admin</b><br />{view.admin_notes}</div>}
            {view.status === 'menunggu' && <button className="btn danger" onClick={() => cancel(view)}>Batalkan pesanan</button>}
          </div>
        </Modal>
      )}
    </>
  )
}
