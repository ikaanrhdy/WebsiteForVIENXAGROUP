export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="logo-badge footer-logo">
        <img src="/vienxa-group-logo.jpeg" alt="Logo VIENXA GROUP" />
      </div>
      <p>Ekosistem Usaha Kuliner, Ritel, Kreatif, dan Teknologi</p>
      <small>© {new Date().getFullYear()} VIENXA GROUP. Seluruh hak dilindungi.</small>
    </footer>
  )
}
