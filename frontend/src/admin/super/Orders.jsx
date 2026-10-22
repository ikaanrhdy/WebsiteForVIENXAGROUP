import { useState } from 'react'
import { useApi } from '../../lib/useApi.js'
import { api } from '../../lib/api.js'
import { Card, State, Modal, OrdersTable, SearchField, STATUS } from '../ui.jsx'

export default function Orders() {
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useApi(`/admin/orders${filter ? `?status=${filter}` : ''}`)
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState('')
  const filteredOrders = (data?.data || []).filter((order) => [
    order.code, order.project_name, order.description, order.user?.name, order.user?.email,
    order.package?.name, order.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const open = (o) => { setErr(''); setEdit({ ...o, amount: o.amount ?? '', admin_notes: o.admin_notes ?? '' }) }
  const save = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/orders/${edit.id}`, {
        status: edit.status,
        amount: edit.amount === '' ? null : Number(edit.amount),
        admin_notes: edit.admin_notes || null,
      })
      setEdit(null); reload()
    } catch (e2) { setErr(e2.message) }
  }

  return (
    <>
      <h1 className="ptitle">Pesanan</h1>
      <Card title="Semua pesanan" action={<div className="card-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan..." />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter status">
          <option value="">Semua status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && <OrdersTable orders={filteredOrders} showUser emptyText={search ? 'Tidak ada pesanan yang cocok dengan pencarian.' : 'Belum ada pesanan.'} actions={(o) => <button className="btn sm ghost" onClick={() => open(o)}>Kelola</button>} />}
      </Card>

      {edit && (
        <Modal title={`Pesanan ${edit.code}`} onClose={() => setEdit(null)}>
          <form className="form" onSubmit={save}>
            <p><b>{edit.project_name}</b><br /><span className="muted">{edit.user?.name} · {edit.package?.name}</span></p>
            <p className="desc">{edit.description}</p>
            {edit.items?.length > 0 && (
              <div className="order-items">
                <b>Produk pesanan</b>
                {edit.items.map((item) => (
                  <p key={item.id}>{item.product_name} × {item.quantity} · {item.unit_price == null ? 'Hubungi admin' : `Rp ${new Intl.NumberFormat('id-ID').format(item.unit_price * item.quantity)}`}</p>
                ))}
              </div>
            )}
            {err && <div className="alert">{err}</div>}
            <label>Status
              <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
            <label>Nilai kesepakatan (Rp)<input type="number" min="0" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} /></label>
            <label>Catatan untuk pembeli<textarea rows="3" value={edit.admin_notes} onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })} /></label>
            <button className="btn">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  )
}
