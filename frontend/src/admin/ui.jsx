import { rupiah } from '../lib/api.js'

export const STATUS = {
  menunggu: { label: 'Menunggu', cls: 'warning' },
  diproses: { label: 'Diproses', cls: 'info' },
  selesai: { label: 'Selesai', cls: 'success' },
  dibatalkan: { label: 'Dibatalkan', cls: 'danger' },
  disetujui: { label: 'Disetujui', cls: 'success' },
  ditolak: { label: 'Ditolak', cls: 'danger' },
}

export const Badge = ({ status }) => {
  const s = STATUS[status] || { label: status, cls: 'secondary' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export const StatCard = ({ color, value, label, hint }) => (
  <div className={`stat ${color}`}>
    <b>{value}</b>
    <span>{label}</span>
    {hint && <small>{hint}</small>}
  </div>
)

export const Card = ({ title, action, children }) => (
  <section className="dcard">
    <header><h3>{title}</h3>{action}</header>
    <div className="dcard-body">{children}</div>
  </section>
)

export const SearchField = ({ value, onChange, placeholder = 'Cari...' }) => (
  <label className="search-field">
    <span aria-hidden="true">⌕</span>
    <input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
)

export const State = ({ loading, error, onRetry }) => {
  if (loading) return <p className="muted pad">Memuat data…</p>
  if (error) return <div className="alert">{error} {onRetry && <button className="link" onClick={onRetry}>Coba lagi</button>}</div>
  return null
}

export const Modal = ({ title, onClose, children }) => (
  <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <header><h3>{title}</h3><button className="x" aria-label="Tutup" onClick={onClose}>×</button></header>
      {children}
    </div>
  </div>
)

export const OrdersTable = ({ orders, showUser, actions, emptyText = 'Belum ada pesanan.' }) => (
  <div className="table-wrap">
    <table>
      <thead><tr><th>Kode</th>{showUser && <th>Pembeli</th>}<th>Proyek</th><th>Paket</th><th>Status</th><th>Nilai</th><th>Tanggal</th>{actions && <th />}</tr></thead>
      <tbody>
        {orders.length === 0 && <tr><td colSpan={6 + (showUser ? 1 : 0) + (actions ? 1 : 0)} className="muted">{emptyText}</td></tr>}
        {orders.map((o) => (
          <tr key={o.id}>
            <td><code>{o.code}</code></td>
            {showUser && <td>{o.user?.name}<br /><small className="muted">{o.user?.email}</small></td>}
            <td>{o.project_name}</td>
            <td>{o.package?.name || '-'}</td>
            <td><Badge status={o.status} /></td>
            <td>{rupiah(o.amount)}</td>
            <td>{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
            {actions && <td className="right">{actions(o)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
