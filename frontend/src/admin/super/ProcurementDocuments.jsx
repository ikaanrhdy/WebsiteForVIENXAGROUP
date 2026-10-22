import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { rupiah } from '../../lib/api.js'
import { useApi } from '../../lib/useApi.js'
import { Badge, Card, State } from '../ui.jsx'

const documents = [
  { id: 'po', label: 'Surat Pesanan' },
  { id: 'bast', label: 'Berita Acara Pemeriksaan/Penerimaan' },
  { id: 'gambar-bast', label: 'Gambar BAST' },
  { id: 'shp', label: 'Surat Hasil Pemeriksaan' },
  { id: 'invoice', label: 'Invoice Pembayaran' },
  { id: 'kuitansi', label: 'Kuitansi Pembayaran' },
]

function Signature({ labels, date }) {
  return (
    <div className="print-signatures">
      {date && <p className="print-signature-date">{date}</p>}
      {labels.map((label) => <div key={label}><span>{label}</span><i /><small>(________________________)</small></div>)}
    </div>
  )
}

function DocumentHeader({ title, request, suffix }) {
  return (
    <>
      <header className="print-brand">
        <img src="/vienxa-group-logo.jpeg" alt="Logo utama VIENXA GROUP" />
        <div><b>VIENXA GROUP</b><span>Dokumen Pengadaan Barang / Jasa</span></div>
      </header>
      <h1 className="print-title">{title}</h1>
      <div className="print-reference">
        <span>Nomor: <b>{request.code}/{suffix}</b></span>
        <span>Tanggal: <b>{new Date(request.created_at).toLocaleDateString('id-ID')}</b></span>
      </div>
      <hr className="print-rule" />
    </>
  )
}

function InfoTable({ rows }) {
  return (
    <table className="print-info-table">
      <tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>:</td><td>{value || <span className="print-blank" />}</td></tr>)}</tbody>
    </table>
  )
}

function DetailTable({ request, mode = 'order', edit }) {
  const hasPrice = mode === 'price'
  const isReceipt = mode === 'receipt'

  return (
    <table className="print-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>Nama barang / jasa</th>
          <th>Jumlah{isReceipt ? ' dipesan' : ''}</th>
          {isReceipt && <><th>Jumlah diterima</th><th>Kondisi baik</th><th>Kondisi rusak</th></>}
          {hasPrice && <><th>Harga satuan</th><th>Total harga</th></>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>{request.item_name}<br /><small>{request.description}</small></td>
          <td>{request.quantity} {request.item_unit}</td>
          {isReceipt && <>
            <td>{edit('received_quantity', 'Jumlah diterima', 'print-edit-table-input')}</td>
            <td>{edit('good_quantity', 'Jumlah kondisi baik', 'print-edit-table-input')}</td>
            <td>{edit('damaged_quantity', 'Jumlah kondisi rusak', 'print-edit-table-input')}</td>
          </>}
          {hasPrice && <>
            <td>{edit('unit_price', 'Harga satuan', 'print-edit-table-input')}</td>
            <td>{edit('line_total', 'Total harga', 'print-edit-table-input')}</td>
          </>}
        </tr>
      </tbody>
    </table>
  )
}

function PrintContent({ type, request, photos, values, onEdit }) {
  const edit = (key, placeholder = 'Lengkapi kolom ini', className = 'print-edit-field', initialValue = '') => (
    <span className={className}>
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={values[key] ?? initialValue ?? ''}
        onChange={(event) => onEdit(key, event.target.value)}
      />
    </span>
  )
  const editableText = (key, placeholder) => (
    <textarea
      className="print-edit-textarea"
      aria-label={placeholder}
      placeholder={placeholder}
      value={values[key] ?? ''}
      onChange={(event) => onEdit(key, event.target.value)}
    />
  )

  if (type === 'po') {
    return (
      <>
        <DocumentHeader title="SURAT PESANAN (SP)" request={request} suffix="SP" />
        <InfoTable rows={[
          ['Nama instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
          ['Paket pesanan', 'Pengadaan barang / jasa'],
          ['Sumber dana', edit('source_of_funds', 'Contoh: Anggaran perusahaan')],
          ['Tanggal negosiasi', edit('negotiation_date', 'Tanggal negosiasi')],
          ['Waktu pengerjaan', edit('work_period', 'Contoh: 14 hari kerja')],
          ['Waktu pengiriman', edit('delivery_period', 'Tanggal / waktu pengiriman')],
        ]} />
        <div className="print-party-grid">
          <section>
            <h2>PENYEDIA</h2>
            <InfoTable rows={[
              ['Nama penyedia', edit('provider_name', 'Nama penyedia')],
              ['Alamat penyedia', edit('provider_address', 'Alamat penyedia')],
              ['Kontak penyedia', edit('provider_contact', 'Kontak penyedia')],
              ['NPWP penyedia', edit('provider_tax_id', 'NPWP penyedia')],
            ]} />
          </section>
          <section>
            <h2>PEMBELI / PEMOHON</h2>
            <InfoTable rows={[
              ['Nama penanggung jawab', edit('representative_name', 'Nama penanggung jawab', 'print-edit-field', request.representative_name || request.user?.name)],
              ['Nama instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
              ['Alamat instansi', edit('organization_address', 'Alamat instansi', 'print-edit-field', request.organization_address)],
              ['Kontak instansi', edit('contact_phone', 'Kontak instansi', 'print-edit-field', request.contact_phone)],
              ['NPWP / identitas', edit('organization_tax_id', 'NPWP / identitas', 'print-edit-field', request.organization_tax_id)],
            ]} />
          </section>
        </div>
        <h2 className="print-section-title">HAK DAN KEWAJIBAN PARA PIHAK</h2>
        <ol className="print-terms">
          <li>Penyedia menyiapkan barang atau jasa sesuai rincian dan kesepakatan para pihak.</li>
          <li>Penerimaan dilakukan setelah barang atau jasa diperiksa bersama dan dituangkan dalam berita acara.</li>
          <li>Tagihan disampaikan berdasarkan barang atau jasa yang telah diterima sesuai kesepakatan.</li>
          <li>Pemohon berhak memeriksa kesesuaian jumlah, spesifikasi, dan kondisi barang atau jasa.</li>
          <li>Perubahan waktu, rincian, atau nilai pesanan dicatat dan disetujui oleh para pihak.</li>
          <li>Perselisihan diselesaikan terlebih dahulu melalui musyawarah sesuai ketentuan yang berlaku.</li>
        </ol>
        <Signature date={<>Tempat, tanggal: {edit('po_signature_date', 'Tempat dan tanggal tanda tangan', 'print-edit-inline')}</>} labels={['PENYEDIA', 'PEMOHON']} />
        <div className="print-page-break" />
        <h2 className="print-section-title">RINCIAN PEKERJAAN</h2>
        <DetailTable request={request} mode="price" edit={edit} />
        <div className="print-summary-table">
          <InfoTable rows={[
            ['Total harga', edit('total_price', 'Total harga')],
            ['Biaya pengiriman', edit('shipping_cost', 'Biaya pengiriman')],
            ['Pajak', edit('tax_amount', 'Pajak')],
            ['Total pembayaran', edit('total_payment', 'Total pembayaran')],
            ['Terbilang', edit('total_in_words', 'Terbilang')],
          ]} />
        </div>
        {request.estimated_budget != null && <p className="print-muted">Perkiraan anggaran pengajuan: {rupiah(request.estimated_budget)}. Nilai ini bukan harga kesepakatan.</p>}
      </>
    )
  }

  if (type === 'bast') {
    return (
      <>
        <DocumentHeader title="BERITA ACARA SERAH TERIMA" request={request} suffix="BAST" />
        <p>Pada hari ini, tanggal {edit('bast_date', 'Tanggal berita acara', 'print-edit-inline')}, sesuai dengan:</p>
        <InfoTable rows={[
          ['Nomor surat pesanan', request.code],
          ['Nama pekerjaan', request.title],
          ['Tanggal pemesanan', new Date(request.created_at).toLocaleDateString('id-ID')],
          ['Tanggal barang diterima', edit('received_date', 'Tanggal barang diterima')],
        ]} />
        <p className="print-label">PIHAK PERTAMA — YANG MENYERAHKAN</p>
        <InfoTable rows={[
          ['Nama', edit('handover_name', 'Nama pihak yang menyerahkan')],
          ['Jabatan', edit('handover_position', 'Jabatan pihak yang menyerahkan')],
          ['Nama perusahaan', edit('handover_company', 'Nama perusahaan penyedia')],
          ['Alamat perusahaan', edit('handover_address', 'Alamat perusahaan penyedia')],
          ['Nomor telepon', edit('handover_phone', 'Nomor telepon penyedia')],
        ]} />
        <p className="print-label">PIHAK KEDUA — YANG MENERIMA</p>
        <InfoTable rows={[
          ['Nama', edit('representative_name', 'Nama pihak yang menerima', 'print-edit-field', request.representative_name || request.user?.name)],
          ['Jabatan', edit('recipient_position', 'Jabatan pihak yang menerima')],
          ['Nama instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
          ['Alamat instansi', edit('organization_address', 'Alamat instansi', 'print-edit-field', request.organization_address)],
          ['Nomor telepon', edit('contact_phone', 'Nomor telepon', 'print-edit-field', request.contact_phone)],
        ]} />
        <p className="print-paragraph">PIHAK PERTAMA menyerahkan hasil pekerjaan kepada PIHAK KEDUA. PIHAK KEDUA menyatakan telah menerima dan memeriksa barang / jasa sesuai rincian pekerjaan terlampir.</p>
        <p className="print-paragraph">Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
        <Signature date={<>Tempat, tanggal: {edit('bast_signature_date', 'Tempat dan tanggal tanda tangan', 'print-edit-inline')}</>} labels={['PIHAK PERTAMA', 'PIHAK KEDUA']} />
        <div className="print-page-break" />
        <h2 className="print-section-title">LAMPIRAN RINCIAN PEKERJAAN</h2>
        <DetailTable request={request} mode="receipt" edit={edit} />
        <div className="print-inspection-box"><b>Catatan pemeriksaan / kondisi barang:</b>{editableText('inspection_notes', 'Tulis catatan pemeriksaan')}</div>
        <Signature labels={['PEMERIKSA BARANG']} />
      </>
    )
  }

  if (type === 'gambar-bast') {
    return (
      <>
        <DocumentHeader title="LAMPIRAN DOKUMENTASI BAST" request={request} suffix="BAST" />
        <InfoTable rows={[
          ['Nomor surat pesanan', request.code],
          ['Nama pekerjaan', request.title],
          ['Barang / jasa', request.item_name],
          ['Jumlah', `${request.quantity} ${request.item_unit || ''}`],
        ]} />
        <div className="print-photo-grid">
          {['Dokumentasi 1', 'Dokumentasi 2', 'Dokumentasi 3', 'Dokumentasi 4'].map((label, index) => (
            <div key={label}>
              {photos[index] ? <img src={photos[index].url} alt={photos[index].name} /> : <><span>{label}</span><small>Foto barang / jasa yang diterima</small></>}
            </div>
          ))}
        </div>
        <p className="print-label">Keterangan dokumentasi</p>{editableText('photo_notes', 'Tulis keterangan dokumentasi')}
        <Signature date={<>Tempat, tanggal: {edit('photo_signature_date', 'Tempat dan tanggal tanda tangan', 'print-edit-inline')}</>} labels={['PIHAK KEDUA', 'PEMERIKSA BARANG']} />
      </>
    )
  }

  if (type === 'shp') {
    return (
      <>
        <DocumentHeader title="SURAT HASIL PEMERIKSAAN" request={request} suffix="SHP" />
        <p>Pada hari ini, tanggal {edit('inspection_date', 'Tanggal pemeriksaan', 'print-edit-inline')}, sesuai dengan:</p>
        <InfoTable rows={[
          ['Nomor surat pesanan', request.code],
          ['Tanggal', new Date(request.created_at).toLocaleDateString('id-ID')],
          ['Nama pekerjaan', request.title],
          ['Tahun', new Date(request.created_at).getFullYear()],
          ['Nama pemeriksa', edit('representative_name', 'Nama pemeriksa', 'print-edit-field', request.representative_name || request.user?.name)],
          ['Jabatan', edit('inspector_position', 'Jabatan pemeriksa')],
          ['Nama instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
          ['Alamat instansi', edit('organization_address', 'Alamat instansi', 'print-edit-field', request.organization_address)],
          ['Nomor telepon', edit('contact_phone', 'Nomor telepon', 'print-edit-field', request.contact_phone)],
        ]} />
        <p>Telah dilakukan pemeriksaan terhadap hasil pekerjaan dengan rincian sebagai berikut:</p>
        <table className="print-table print-result-table">
          <thead><tr><th>No.</th><th>Nama barang / jasa</th><th>Jumlah</th><th>Spesifikasi</th><th>Kondisi</th></tr></thead>
          <tbody><tr><td>1</td><td>{request.item_name}</td><td>{request.quantity} {request.item_unit}</td><td>{edit('inspection_specification', 'Spesifikasi', 'print-edit-table-input')}</td><td>{edit('inspection_condition', 'Kondisi barang', 'print-edit-table-input')}</td></tr></tbody>
        </table>
        <p>Demikian surat hasil pemeriksaan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana seharusnya.</p>
        <Signature date={<>Tempat, tanggal: {edit('inspection_signature_date', 'Tempat dan tanggal tanda tangan', 'print-edit-inline')}</>} labels={['PIHAK PERTAMA', 'PIHAK KEDUA']} />
      </>
    )
  }

  if (type === 'invoice') {
    return (
      <>
        <DocumentHeader title="INVOICE" request={request} suffix="INV" />
        <div className="print-party-grid">
          <section>
            <h2>DARI</h2>
            <InfoTable rows={[
              ['Nama penyedia', edit('provider_name', 'Nama penyedia')],
              ['Alamat penyedia', edit('provider_address', 'Alamat penyedia')],
              ['Kontak penyedia', edit('provider_contact', 'Kontak penyedia')],
              ['NPWP penyedia', edit('provider_tax_id', 'NPWP penyedia')],
            ]} />
          </section>
          <section>
            <h2>UNTUK</h2>
            <InfoTable rows={[
              ['Nama penanggung jawab', edit('representative_name', 'Nama penanggung jawab', 'print-edit-field', request.representative_name || request.user?.name)],
              ['Nama instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
              ['Alamat instansi', edit('organization_address', 'Alamat instansi', 'print-edit-field', request.organization_address)],
              ['Kontak instansi', edit('contact_phone', 'Kontak instansi', 'print-edit-field', request.contact_phone)],
              ['NPWP / identitas', edit('organization_tax_id', 'NPWP / identitas', 'print-edit-field', request.organization_tax_id)],
            ]} />
          </section>
        </div>
        <h2 className="print-section-title">RINCIAN TAGIHAN</h2>
        <DetailTable request={request} mode="price" edit={edit} />
        <div className="print-summary-table">
          <InfoTable rows={[
            ['Subtotal', edit('total_price', 'Subtotal')],
            ['Pajak', edit('tax_amount', 'Pajak')],
            ['Biaya pengiriman', edit('shipping_cost', 'Biaya pengiriman')],
            ['GRAND TOTAL', edit('total_payment', 'Total pembayaran')],
            ['Terbilang', edit('total_in_words', 'Terbilang')],
          ]} />
        </div>
        {request.estimated_budget != null && <p className="print-muted">Perkiraan anggaran pengajuan: {rupiah(request.estimated_budget)}. Bukan nilai invoice atau bukti pembayaran.</p>}
        <InfoTable rows={[
          ['Metode pembayaran', edit('payment_method', 'Metode pembayaran')],
          ['Informasi rekening', edit('bank_details', 'Informasi rekening tujuan')],
          ['Tanggal jatuh tempo', edit('due_date', 'Tanggal jatuh tempo')],
        ]} />
        <Signature date={<>Tempat, tanggal: {edit('invoice_date', 'Tempat dan tanggal invoice', 'print-edit-inline')}</>} labels={['PENYEDIA']} />
      </>
    )
  }

  return (
    <>
      <DocumentHeader title="KUITANSI / BUKTI PEMBAYARAN" request={request} suffix="KUITANSI" />
      <div className="print-receipt">
        <InfoTable rows={[
          ['Nomor', `${request.code}/KUITANSI`],
          ['Satuan pendidikan / instansi', edit('organization_name', 'Nama instansi', 'print-edit-field', request.organization_name)],
          ['Total tagihan', edit('receipt_total', 'Total tagihan')],
          ['Tanggal pemesanan', new Date(request.created_at).toLocaleDateString('id-ID')],
          ['Tanggal pembayaran', edit('payment_date', 'Tanggal pembayaran')],
          ['Pembayaran terverifikasi', edit('payment_verified', 'Status verifikasi pembayaran')],
        ]} />
        <p><b>Untuk pembayaran</b></p>
        <p>Pembayaran barang / jasa yang dipesan dengan nomor pengajuan {request.code}.</p>
        <p>Terbilang: {edit('receipt_total_in_words', 'Nilai pembayaran dengan huruf', 'print-edit-inline')}</p>
        {request.estimated_budget != null && <p className="print-muted">Perkiraan anggaran pengajuan: {rupiah(request.estimated_budget)}. Lengkapi nilai pembayaran setelah transaksi.</p>}
      </div>
      <Signature date={<>Diterbitkan di: {edit('receipt_issued_place', 'Kota penerbitan', 'print-edit-inline')}, tanggal {edit('receipt_issued_date', 'Tanggal kuitansi', 'print-edit-inline')}</>} labels={['PENERIMA PEMBAYARAN']} />
    </>
  )
}

export default function ProcurementDocuments() {
  const { id } = useParams()
  const { data, loading, error, reload } = useApi(`/admin/pengadaan/${id}`)
  const [active, setActive] = useState(documents[0].id)
  const [photos, setPhotos] = useState([])
  const [values, setValues] = useState({})
  const [photoError, setPhotoError] = useState('')
  const request = data?.data
  const updateField = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  useEffect(() => () => photos.forEach((photo) => URL.revokeObjectURL(photo.url)), [photos])

  const selectPhotos = (event) => {
    const selected = Array.from(event.target.files || [])
    if (selected.length > 4) {
      setPhotoError('Pilih maksimal 4 foto dokumentasi.')
      event.target.value = ''
      return
    }
    if (selected.some((file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)) {
      setPhotoError('Setiap file harus berupa gambar dengan ukuran maksimal 5 MB.')
      event.target.value = ''
      return
    }
    setPhotoError('')
    setPhotos(selected.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })))
  }

  if (loading || error) return <State loading={loading} error={error} onRetry={reload} />
  if (!request) return <div className="alert">Data pengajuan tidak ditemukan.</div>
  if (request.status !== 'disetujui') {
    return (
      <>
        <h1 className="ptitle">Template dokumen pengadaan</h1>
        <div className="alert">Template dokumen hanya tersedia setelah pengajuan disetujui.</div>
        <Link className="btn sm ghost" to="/admin/pengadaan">Kembali ke pengajuan</Link>
      </>
    )
  }

  return (
    <div className="procurement-documents">
      <div className="procurement-documents-heading">
        <div><h1 className="ptitle">Template dokumen pengadaan</h1><p>{request.code} · {request.title}</p></div>
        <Link className="btn sm ghost" to="/admin/pengadaan">Kembali ke konfirmasi</Link>
      </div>
      <Card title="Pilih template">
        <div className="document-template-list">
          {documents.map((document) => (
            <button className={active === document.id ? 'document-template active' : 'document-template'} key={document.id} onClick={() => setActive(document.id)}>
              {document.label}
            </button>
          ))}
        </div>
        <div className="document-template-action">
          <span><Badge status={request.status} /> Klik kolom bergaris pada pratinjau untuk melengkapi dokumen sebelum dicetak.</span>
          <button className="btn" onClick={() => window.print()}>Cetak / simpan PDF</button>
        </div>
      </Card>
      {active === 'gambar-bast' && (
        <Card title="Foto dokumentasi BAST">
          <label className="print-photo-upload">Pilih maksimal 4 foto, masing-masing maksimal 5 MB
            <input type="file" accept="image/*" multiple onChange={selectPhotos} />
          </label>
          {photoError && <div className="alert">{photoError}</div>}
        </Card>
      )}
      <section className="print-sheet-wrap" aria-label="Pratinjau dokumen">
        <article id="procurement-print-sheet" className="print-sheet">
          <PrintContent type={active} request={request} photos={photos} values={values} onEdit={updateField} />
          <footer className="print-footer">VIENXA GROUP · {request.code}</footer>
        </article>
      </section>
    </div>
  )
}
