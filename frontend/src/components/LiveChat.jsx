import { useState, useEffect, useRef } from 'react'
import { ChatIcon } from './icons.jsx'

const commonQuestions = [
  { label: 'Layanan Web & IT', question: 'Layanan Web & IT apa saja yang tersedia?' },
  { label: 'Cara memesan', question: 'Bagaimana cara memesan paket?' },
  { label: 'Produk unit usaha', question: 'Produk unit usaha apa saja yang tersedia?' },
  { label: 'Pengadaan', question: 'Bagaimana cara mengajukan pengadaan?' },
  { label: 'Cek pesanan', question: 'Bagaimana cara melihat status pesanan?' },
]

function getAnswer(question) {
  const text = question.toLocaleLowerCase('id-ID')
  if (/pengadaan|pengajuan|dokumen|bast|kuitansi/.test(text)) {
    return 'Untuk pengadaan, masuk atau daftar akun terlebih dahulu, lalu buka Dashboard > Pengajuan Pengadaan. Isi data kebutuhan dan kirim pengajuan. Status serta catatan admin dapat dilihat kembali di menu yang sama; dokumen pengadaan tersedia untuk admin setelah pengajuan disetujui.'
  }
  if (/memesan|pesan paket|buat pesanan/.test(text)) {
    return 'Untuk memesan paket, masuk ke akun Anda, buka Dashboard > Pesan Paket, pilih paket, lalu isi nama proyek dan detail kebutuhan sebelum mengirim. Untuk membeli produk unit usaha, buka Produk Saya, tambahkan produk ke keranjang, lalu pilih Buat Pesanan.'
  }
  if (/pesanan|order|status|lacak|tracking/.test(text)) {
    return 'Masuk ke akun Anda, lalu buka Dashboard > Pesanan Saya untuk melihat status, detail, dan catatan admin. Pesanan produk dibuat dari keranjang, sedangkan pesanan paket dikirim melalui menu Pesan Paket.'
  }
  if (/produk|catering|katering|bakery|roti|thrifting|advertising|affiliate|konten/.test(text)) {
    return 'Produk dan layanan unit usaha tersedia di menu Produk Unit Usaha, antara lain Daopurku Catering, Bakery, Thrifting, Advertising, Affiliate, Content Creator, dan Web & IT. Pilih produk untuk melihat rincian serta opsi menambahkannya ke keranjang.'
  }
  if (/harga|paket|biaya|tarif/.test(text)) {
    return 'Paket Web & IT dapat dilihat di menu Paket Layanan. Ada pilihan untuk website usaha, sekolah, dan organisasi serta kebutuhan custom. Sebagian harga mengikuti kebutuhan; kirim detail proyek lewat menu Pesan Paket agar tim dapat meninjau dan memberikan penawaran.'
  }
  if (/web|website|aplikasi|sistem|ui.?ux|layanan|jasa/.test(text)) {
    return 'Layanan Web & IT meliputi website company profile, website UMKM/toko online, aplikasi dan sistem informasi, desain UI/UX, serta pemeliharaan dan konsultasi. Pilih paket yang sesuai atau jelaskan kebutuhan Anda melalui menu Pesan Paket.'
  }
  if (/bayar|pembayaran|transfer|rekening|invoice/.test(text)) {
    return 'Nilai pesanan dan catatan pembayaran dikonfirmasi oleh admin melalui detail pesanan. Untuk pengadaan, dokumen seperti invoice dan kuitansi dapat dilengkapi pada template dokumen setelah pengajuan disetujui. Mohon konfirmasi metode pembayaran kepada admin sebelum melakukan transfer.'
  }
  if (/akun|daftar|registrasi|login|masuk/.test(text)) {
    return 'Buat akun melalui menu Daftar dan masuk menggunakan email serta kata sandi. Setelah masuk, Anda dapat memesan paket, mengelola keranjang, mengajukan pengadaan, dan memeriksa status pesanan dari dashboard.'
  }
  if (/kontak|whatsapp|admin|hubungi|telepon/.test(text)) {
    return 'Tim VIENXA GROUP dapat dihubungi melalui WhatsApp di 0857-2685-9828 atau email vienxagroup@gmail.com. Sampaikan nama dan ringkasan kebutuhan agar kami dapat membantu dengan tepat.'
  }
  return 'Saya dapat membantu menjelaskan layanan Web & IT, paket, produk unit usaha, cara memesan, status pesanan, dan pengajuan pengadaan. Bisa ceritakan layanan atau kebutuhan yang ingin Anda tanyakan? Jika perlu bantuan langsung, hubungi WhatsApp 0857-2685-9828.'
}

export default function LiveChat({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  // Simpan chat di localStorage per user (simulasi sederhana tanpa backend chat server)
  const STORAGE_KEY = `vienxa_chat_${user ? user.id : 'guest'}`

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setMessages(JSON.parse(saved))
  }, [STORAGE_KEY])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, STORAGE_KEY])

  const sendQuestion = (question) => {
    if (!question.trim() || busy) return
    const now = new Date()
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const userMsg = { id: Date.now(), text: question.trim(), type: 'user', time }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setBusy(true)

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: getAnswer(question), type: 'admin', time, admin: true }])
      setBusy(false)
    }, 500)
  }

  const send = (event) => {
    event.preventDefault()
    sendQuestion(input)
  }

  const toggle = () => setOpen(!open)

  return (
    <>
      {/* Tombol buka chat */}
      <button className="chat-toggle" aria-label="Buka live chat" onClick={toggle}>
        {open ? '×' : <ChatIcon size={23} />}
      </button>

      {/* Kotak chat */}
      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <span>Live Chat VIENXA</span>
            <button className="chat-close" onClick={toggle}>✕</button>
          </div>
          <div className="chat-messages" ref={endRef}>
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p className="chat-empty">
                  Selamat datang di live chat VIENXA GROUP. Pilih pertanyaan atau ketik kebutuhan Anda terkait layanan dan pemesanan.
                </p>
                <div className="chat-faq-list">
                  {commonQuestions.map((item) => (
                    <button type="button" key={item.label} disabled={busy} onClick={() => sendQuestion(item.question)}>{item.label}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.type}`}>
                <span className="chat-text">{m.text}</span>
                <span className="chat-time">{m.time}</span>
              </div>
            ))}
            {busy && <div className="chat-msg admin"><span className="chat-text">Mengetik…</span></div>}
            <div ref={endRef} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan Anda…"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()}>Kirim</button>
          </form>
          <div className="chat-footer">
            <small>Atau hubungi kami lewat WhatsApp: <a href="https://wa.me/6285726859828" target="_blank" rel="noreferrer">0857-2685-9828</a></small>
          </div>
        </div>
      )}
    </>
  )
}