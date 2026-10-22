import { useState } from 'react'
import { api, rupiah } from '../../lib/api.js'
import { useApi } from '../../lib/useApi.js'
import { Badge, Card, SearchField, State } from '../ui.jsx'

const initialForm = {
  title: '',
  organization_name: '',
  representative_name: '',
  organization_address: '',
  contact_phone: '',
  organization_tax_id: '',
  item_name: '',
  quantity: '1',
  item_unit: 'unit',
  estimated_budget: '',
  description: '',
}

export default function Procurement() {
  const { data, loading, error, reload } = useApi('/me/pengadaan')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const filteredRequests = (data?.data || []).filter((request) => [
    request.code, request.title, request.item_name, request.organization_name, request.status,
  ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'))))

  const fieldError = (name) => errors[name] && <small className="field-err">{errors[name][0]}</small>

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage('')
    try {
      await api.post('/me/pengadaan', {
        ...form,
        quantity: Number(form.quantity),
        estimated_budget: form.estimated_budget === '' ? null : Number(form.estimated_budget),
      })
      setForm(initialForm)
      setMessage('Pengajuan berhasil dikirim dan menunggu konfirmasi super admin.')
      reload()
    } catch (submitError) {
      setMessage(submitError.message)
      setErrors(submitError.errors)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="ptitle">Pengajuan pengadaan</h1>
      <p className="procurement-intro">Ajukan kebutuhan barang atau jasa. Super admin akan meninjau dan memberikan keputusan melalui dashboard.</p>
      <Card title="Form pengajuan">
        <form className="form procurement-form" onSubmit={submit}>
          {message && <div className="alert">{message}</div>}
          <label>Nama pengajuan
            <input required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Pengadaan perlengkapan kantor" />
            {fieldError('title')}
          </label>
          <div className="procurement-fields">
            <label>Nama instansi / perusahaan
              <input maxLength={180} value={form.organization_name} onChange={(event) => setForm({ ...form, organization_name: event.target.value })} placeholder="Opsional" />
              {fieldError('organization_name')}
            </label>
            <label>Nama penanggung jawab
              <input maxLength={150} value={form.representative_name} onChange={(event) => setForm({ ...form, representative_name: event.target.value })} placeholder="Opsional" />
              {fieldError('representative_name')}
            </label>
          </div>
          <label>Alamat instansi
            <textarea rows="2" maxLength={1000} value={form.organization_address} onChange={(event) => setForm({ ...form, organization_address: event.target.value })} placeholder="Opsional" />
            {fieldError('organization_address')}
          </label>
          <div className="procurement-fields">
            <label>Nomor kontak
              <input type="tel" maxLength={32} value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="Opsional" />
              {fieldError('contact_phone')}
            </label>
            <label>NPWP / nomor identitas instansi
              <input maxLength={40} value={form.organization_tax_id} onChange={(event) => setForm({ ...form, organization_tax_id: event.target.value })} placeholder="Opsional" />
              {fieldError('organization_tax_id')}
            </label>
          </div>
          <label>Nama barang atau jasa
            <input required maxLength={180} value={form.item_name} onChange={(event) => setForm({ ...form, item_name: event.target.value })} placeholder="Tuliskan barang atau jasa yang dibutuhkan" />
            {fieldError('item_name')}
          </label>
          <div className="procurement-fields procurement-quantity-fields">
            <label>Jumlah
              <input required type="number" min="1" max="100000" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
              {fieldError('quantity')}
            </label>
            <label>Satuan
              <input maxLength={40} value={form.item_unit} onChange={(event) => setForm({ ...form, item_unit: event.target.value })} placeholder="unit, pcs, paket..." />
              {fieldError('item_unit')}
            </label>
            <label>Perkiraan anggaran (Rp)
              <input type="number" min="0" step="1" value={form.estimated_budget} onChange={(event) => setForm({ ...form, estimated_budget: event.target.value })} placeholder="Opsional" />
              {fieldError('estimated_budget')}
            </label>
          </div>
          <label>Alasan dan detail pengajuan
            <textarea required rows="4" maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Jelaskan kebutuhan, spesifikasi, dan informasi pendukung." />
            {fieldError('description')}
          </label>
          <button className="btn" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim pengajuan'}</button>
        </form>
      </Card>

      <Card title="Riwayat pengajuan" action={<SearchField value={search} onChange={setSearch} placeholder="Cari pengajuan..." />}>
        <State loading={loading} error={error} onRetry={reload} />
        {data && (filteredRequests.length ? (
          <div className="procurement-list">
            {filteredRequests.map((request) => (
              <article className="procurement-card" key={request.id}>
                <div className="procurement-card-head">
                  <div><small>{request.code}</small><h3>{request.title}</h3></div>
                  <Badge status={request.status} />
                </div>
                <div className="procurement-progress" aria-label={`Status: ${request.status}`}>
                  <span className="complete">Diajukan</span>
                  <span className={request.status !== 'menunggu' ? 'complete' : ''}>Konfirmasi super admin</span>
                </div>
                <dl className="procurement-details">
                  <div><dt>Barang / jasa</dt><dd>{request.item_name} × {request.quantity} {request.item_unit}</dd></div>
                  <div><dt>Instansi</dt><dd>{request.organization_name || '-'}</dd></div>
                  <div><dt>Perkiraan anggaran</dt><dd>{rupiah(request.estimated_budget)}</dd></div>
                  <div><dt>Tanggal pengajuan</dt><dd>{new Date(request.created_at).toLocaleDateString('id-ID')}</dd></div>
                </dl>
                <p className="procurement-description">{request.description}</p>
                {request.admin_notes && <div className="note-box"><b>Catatan super admin</b><br />{request.admin_notes}</div>}
              </article>
            ))}
          </div>
        ) : <p className="muted">{search ? 'Tidak ada pengajuan yang cocok dengan pencarian.' : 'Belum ada pengajuan. Form di atas dapat digunakan untuk membuat pengajuan pertama.'}</p>)}
      </Card>
    </>
  )
}
