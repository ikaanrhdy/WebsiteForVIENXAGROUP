import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, rupiah } from '../../lib/api.js'
import { useApi } from '../../lib/useApi.js'
import { Badge, Card, Modal, SearchField, State } from '../ui.jsx'

const statusLabels = {
  menunggu: 'Menunggu konfirmasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
}

export default function ProcurementConfirmations() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const path = `/admin/pengadaan${filter ? `?status=${filter}` : ''}`
  const { data, loading, error, reload } = useApi(path)
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const filteredRequests = (data?.data || []).filter((request) => [
    request.code, request.title, request.item_name, request.organization_name,
    request.user?.name, request.user?.email, request.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const open = (request) => {
    setSelected(request)
    setNotes(request.admin_notes || '')
    setMessage('')
  }

  const decide = async (status) => {
    setBusy(true)
    setMessage('')
    try {
      await api.put(`/admin/pengadaan/${selected.id}`, { status, admin_notes: notes || null })
      setSelected(null)
      reload()
    } catch (decisionError) {
      setMessage(decisionError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="ptitle">Konfirmasi pengadaan</h1>
      <p className="procurement-intro">Tinjau pengajuan yang masuk, lalu setujui atau tolak. Keputusan dan catatan akan terlihat oleh pengaju.</p>
      <Card title="Daftar pengajuan" action={<div className="card-actions">
        <SearchField value={search} onChange={setSearch} placeholder="Cari pengajuan..." />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter status pengajuan">
          <option value="">Semua status</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (filteredRequests.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kode</th><th>Pengaju</th><th>Barang / jasa</th><th>Jumlah</th><th>Anggaran</th><th>Status</th><th>Tanggal</th><th /></tr></thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td><code>{request.code}</code></td>
                    <td>{request.user?.name}<br /><small className="muted">{request.user?.email}</small></td>
                    <td>{request.item_name}</td>
                    <td>{request.quantity}</td>
                    <td>{rupiah(request.estimated_budget)}</td>
                    <td><Badge status={request.status} /></td>
                    <td>{new Date(request.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="right"><button className="btn sm ghost" onClick={() => open(request)}>Tinjau</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">{search ? 'Tidak ada pengajuan yang cocok dengan pencarian.' : 'Belum ada pengajuan pada status ini.'}</p>)}
      </Card>

      {selected && (
        <Modal title={`Pengajuan ${selected.code}`} onClose={() => setSelected(null)}>
          <div className="form procurement-review">
            <div className="procurement-card-head">
              <div><small>{selected.code}</small><h3>{selected.title}</h3></div>
              <Badge status={selected.status} />
            </div>
            <dl className="procurement-details">
              <div><dt>Nama pengaju</dt><dd>{selected.user?.name} · {selected.user?.email}</dd></div>
              <div><dt>Instansi / perusahaan</dt><dd>{selected.organization_name || '-'}</dd></div>
              <div><dt>Penanggung jawab</dt><dd>{selected.representative_name || selected.user?.name}</dd></div>
              <div><dt>Alamat instansi</dt><dd>{selected.organization_address || '-'}</dd></div>
              <div><dt>Nomor kontak</dt><dd>{selected.contact_phone || '-'}</dd></div>
              <div><dt>NPWP / nomor identitas</dt><dd>{selected.organization_tax_id || '-'}</dd></div>
              <div><dt>Barang / jasa</dt><dd>{selected.item_name}</dd></div>
              <div><dt>Jumlah</dt><dd>{selected.quantity} {selected.item_unit}</dd></div>
              <div><dt>Perkiraan anggaran</dt><dd>{rupiah(selected.estimated_budget)}</dd></div>
              <div><dt>Tanggal pengajuan</dt><dd>{new Date(selected.created_at).toLocaleString('id-ID')}</dd></div>
            </dl>
            <div><b>Alasan dan detail</b><p className="desc">{selected.description}</p></div>
            {selected.status === 'menunggu' ? (
              <>
                {message && <div className="alert">{message}</div>}
                <label>Catatan untuk pengaju<textarea rows="3" maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opsional" /></label>
                <div className="procurement-actions">
                  <button className="btn danger" type="button" disabled={busy} onClick={() => decide('ditolak')}>{busy ? 'Menyimpan…' : 'Tolak pengajuan'}</button>
                  <button className="btn" type="button" disabled={busy} onClick={() => decide('disetujui')}>{busy ? 'Menyimpan…' : 'Setujui pengajuan'}</button>
                </div>
              </>
            ) : (
              <>
                {selected.admin_notes && <div className="note-box"><b>Catatan super admin</b><br />{selected.admin_notes}</div>}
                {selected.status === 'disetujui' && (
                  <button className="btn" type="button" onClick={() => navigate(`/admin/pengadaan/${selected.id}/dokumen`)}>
                    Buka template dokumen
                  </button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
