import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import logo from "./imports/Logo_for__Vienxa_Group.jpg";

type Unit = {
  id: string;
  name: string;
  label: string;
  short: string;
  description: string;
  detail: string;
  services: string[];
  products: Product[];
  icon: ReactNode;
};

type Product = {
  name: string;
  category: string;
  price: number;
  description: string;
};

type CartItem = Product & { quantity: number };

const contact = {
  phone: "+62 857-2685-9828",
  whatsapp: "6285726859828",
  email: "vienxagroup@gmail.com",
};

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const units: Unit[] = [
  {
    id: "catering",
    name: "Daopurku",
    label: "Catering",
    short: "Sajian istimewa untuk setiap perayaan.",
    description:
      "Layanan katering dengan cita rasa otentik, presentasi elegan, dan pelayanan hangat untuk berbagai momen.",
    detail:
      "Dari pertemuan intim hingga perayaan besar, Daopurku menghadirkan pengalaman kuliner yang dirancang secara personal untuk Anda.",
    services: ["Wedding & event", "Corporate catering", "Daily meals"],
    products: [
      {
        name: "Nasi Box Signature",
        category: "Paket Individual",
        price: 35000,
        description: "Nasi, lauk utama, sayur, sambal, dan air mineral.",
      },
      {
        name: "Paket Prasmanan",
        category: "Minimum 50 pax",
        price: 75000,
        description: "Pilihan menu lengkap dengan penataan meja prasmanan.",
      },
      {
        name: "Snack Box Premium",
        category: "Paket Individual",
        price: 28000,
        description: "Tiga pilihan kudapan premium dan minuman.",
      },
    ],
    icon: (
      <Icon>
        <path d="M6 3v7M9 3v7M6 7h3M7.5 10v11M16 3v18M16 3c3 2 3 7 0 9" />
      </Icon>
    ),
  },
  {
    id: "bakery",
    name: "Vienxa Bakery",
    label: "Bakery",
    short: "Dibuat hangat, dibagikan dengan bahagia.",
    description:
      "Roti, pastry, dan kue premium yang dibuat segar dengan bahan pilihan untuk menyempurnakan hari Anda.",
    detail:
      "Vienxa Bakery memadukan resep klasik dengan sentuhan modern. Setiap produk dibuat dalam batch kecil untuk menjaga rasa dan kualitas.",
    services: ["Artisan bread", "Celebration cake", "Pastry box"],
    products: [
      {
        name: "Vienxa Pastry Box",
        category: "Isi 6",
        price: 95000,
        description: "Koleksi pastry buttery yang dipanggang segar.",
      },
      {
        name: "Celebration Cake",
        category: "Diameter 18 cm",
        price: 285000,
        description: "Kue personal dengan pilihan rasa dan pesan khusus.",
      },
      {
        name: "Artisan Bread Set",
        category: "Isi 4",
        price: 78000,
        description: "Roti artisan pilihan untuk dinikmati bersama.",
      },
    ],
    icon: (
      <Icon>
        <path d="M5 16c-2-1-2-5 1-6 0-3 4-5 6-2 3-2 7 1 6 4 3 2 1 6-2 6H7c-2 0-3-1-2-2Z" />
        <path d="M8 12c1 1 1 4 1 6M13 10c-1 2-1 5-1 8M17 12c-1 1-1 4-1 6" />
      </Icon>
    ),
  },
  {
    id: "thrifting",
    name: "Vienxa Thrifting",
    label: "Fashion",
    short: "Gaya berkarakter, pilihan lebih bertanggung jawab.",
    description:
      "Koleksi preloved terkurasi untuk pribadi yang ingin tampil berbeda sekaligus memilih gaya hidup berkelanjutan.",
    detail:
      "Kami menyeleksi setiap potong berdasarkan kondisi, keunikan, dan relevansi gaya agar pengalaman thrifting terasa lebih premium.",
    services: ["Curated preloved", "Personal styling", "Consignment"],
    products: [
      {
        name: "Curated Blouse",
        category: "Preloved pilihan",
        price: 89000,
        description: "Blouse berkondisi prima yang telah dikurasi.",
      },
      {
        name: "Vintage Outer",
        category: "Limited piece",
        price: 149000,
        description: "Outer unik untuk melengkapi gaya personal Anda.",
      },
      {
        name: "Personal Styling",
        category: "Sesi 60 menit",
        price: 175000,
        description: "Konsultasi gaya dan rekomendasi koleksi.",
      },
    ],
    icon: (
      <Icon>
        <path d="M9 5a3 3 0 1 1 4 2.8L20 13l-8 8-8-8 5-4" />
      </Icon>
    ),
  },
  {
    id: "advertising",
    name: "Vienxa Advertising",
    label: "Creative Agency",
    short: "Ide yang bergerak, strategi yang berdampak.",
    description:
      "Solusi kreatif dan komunikasi brand yang membantu bisnis tampil relevan, konsisten, dan mudah diingat.",
    detail:
      "Kami menyatukan strategi, desain, dan kampanye digital untuk membangun koneksi bermakna antara brand dan audiensnya.",
    services: ["Brand strategy", "Social campaign", "Creative production"],
    products: [
      {
        name: "Social Media Starter",
        category: "12 konten",
        price: 1500000,
        description: "Perencanaan, desain, dan caption konten bulanan.",
      },
      {
        name: "Brand Identity",
        category: "Paket bisnis",
        price: 2750000,
        description: "Logo, palet warna, tipografi, dan panduan dasar.",
      },
      {
        name: "Campaign Creative",
        category: "Per kampanye",
        price: 3500000,
        description: "Konsep kreatif dan aset utama kampanye digital.",
      },
    ],
    icon: (
      <Icon>
        <path d="m4 13 3 7h4l-2-6M5 13h3l10-5v8L8 13H5a2 2 0 0 1 0-4h3" />
        <path d="M18 10a3 3 0 0 1 0 4" />
      </Icon>
    ),
  },
  {
    id: "affiliate",
    name: "Vienxa Affiliate",
    label: "Commerce",
    short: "Menghubungkan rekomendasi dengan peluang.",
    description:
      "Ekosistem affiliate yang menghubungkan produk berkualitas, kreator tepercaya, dan pertumbuhan yang terukur.",
    detail:
      "Program kami dirancang transparan dan mudah diakses, memberi partner ruang untuk berkembang bersama produk yang mereka percaya.",
    services: ["Partner network", "Product campaign", "Performance insight"],
    products: [
      {
        name: "Affiliate Starter",
        category: "Paket bulanan",
        price: 750000,
        description: "Aktivasi produk melalui jaringan partner pilihan.",
      },
      {
        name: "Creator Campaign",
        category: "5 kreator",
        price: 2250000,
        description: "Kampanye terarah bersama micro creator.",
      },
      {
        name: "Performance Report",
        category: "Analisis kampanye",
        price: 500000,
        description: "Laporan performa dan rekomendasi pertumbuhan.",
      },
    ],
    icon: (
      <Icon>
        <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
      </Icon>
    ),
  },
  {
    id: "content",
    name: "Vienxa Creator",
    label: "Content Studio",
    short: "Cerita autentik, konten yang melekat.",
    description:
      "Produksi konten yang mengubah gagasan menjadi visual, cerita, dan pengalaman digital yang berkesan.",
    detail:
      "Mulai dari konsep hingga publikasi, studio kami membantu brand hadir secara autentik melalui konten yang relevan dan konsisten.",
    services: ["Content planning", "Photo & video", "Creator partnership"],
    products: [
      {
        name: "Product Photography",
        category: "10 foto",
        price: 850000,
        description: "Foto produk profesional dengan satu konsep visual.",
      },
      {
        name: "Short Video",
        category: "30–60 detik",
        price: 1250000,
        description: "Video vertikal siap tayang untuk media sosial.",
      },
      {
        name: "Monthly Content",
        category: "16 konten",
        price: 3200000,
        description: "Paket strategi dan produksi konten satu bulan.",
      },
    ],
    icon: (
      <Icon>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="m10 10 5 3-5 3Z" />
        <path d="m8 6 1-2h6l1 2" />
      </Icon>
    ),
  },
];

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M14 7l5 5-5 5" />
  </svg>
);

function Header({
  onHome,
  onExplore,
  compact = false,
}: {
  onHome: () => void;
  onExplore: () => void;
  compact?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`site-header ${compact ? "site-header--compact" : ""}`}>
      <button className="brand" onClick={onHome} aria-label="Kembali ke beranda">
        <span className="brand-mark">
          <img
            src={new URL("./imports/Logo_RB.png", import.meta.url).href}
            alt=""
            style={{ objectFit: "contain", transform: "scale(0.72)" }}
          />
        </span>
        <span className="brand-name">
          VIENXA <small>GROUP</small>
        </span>
      </button>

      <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Navigasi utama">
        <button onClick={onHome}>Beranda</button>
        <button onClick={onExplore}>Unit Usaha</button>
        <a href="#tentang" onClick={() => setMenuOpen(false)}>
          Tentang
        </a>
        <a
          className="nav-contact"
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noreferrer"
        >
          Hubungi Kami
        </a>
      </nav>

      <button
        className="menu-button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label="Buka menu"
      >
        <span />
        <span />
      </button>
    </header>
  );
}

function Home({ onSelect }: { onSelect: (unit: Unit) => void }) {
  const scrollToUnits = () =>
    document.getElementById("unit-usaha")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Satu visi, beragam kemungkinan</p>
          <h1>
            Bertumbuh bersama,
            <br />
            <span>menciptakan makna.</span>
          </h1>
          <p className="hero-description">
            VIENXA Group menaungi berbagai unit usaha yang hadir untuk memperkaya
            keseharian—dari rasa, gaya, hingga karya.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={scrollToUnits}>
              Jelajahi Unit Usaha <Arrow />
            </button>
            <a className="text-link" href="#tentang">
              Kenali VIENXA <span>↘</span>
            </a>
          </div>
          <div className="hero-meta">
            <span>EST.</span>
            <strong>2026</strong>
            <i />
            <span>INDONESIA</span>
          </div>
        </div>

        <div className="hero-emblem" aria-label="Logo VIENXA Group">
          <div className="emblem-ring">
            <img src={logo} alt="VIENXA Group" />
          </div>
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
        </div>

        <button className="scroll-hint" onClick={scrollToUnits}>
          <span>GULIR UNTUK MENJELAJAH</span>
          <i>↓</i>
        </button>
      </section>

      <section className="units-section" id="unit-usaha">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ekosistem kami</p>
            <h2>Unit usaha VIENXA</h2>
          </div>
          <p>
            Setiap unit memiliki keahlian berbeda, dipersatukan oleh komitmen
            yang sama terhadap kualitas dan pengalaman.
          </p>
        </div>

        <div className="unit-grid">
          {units.map((unit, index) => (
            <button
              className="unit-card"
              key={unit.id}
              onClick={() => onSelect(unit)}
            >
              <span className="card-number">0{index + 1}</span>
              <span className="unit-icon">{unit.icon}</span>
              <span className="card-label">{unit.label}</span>
              <strong>{unit.name}</strong>
              <span className="card-description">{unit.short}</span>
              <span className="card-link">
                Kunjungi unit <Arrow />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="about-section" id="tentang">
        <div className="about-visual">
          <span className="block w-[52%] max-w-[340px]">
            <img
              className="block h-auto w-full mix-blend-screen"
              src={
                new URL(
                  "./imports/Logo_for__Vienxa_Group-removebg-preview-2.png",
                  import.meta.url,
                ).href
              }
              alt="VIENXA Group"
            />
          </span>
          <p>Value · Innovation · Excellence</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow">Tentang VIENXA</p>
          <h2>Lebih dari sebuah grup, kami adalah ekosistem.</h2>
          <p>
            Kami percaya bisnis terbaik lahir dari perhatian terhadap detail,
            keberanian untuk berinovasi, dan hubungan yang dibangun dengan
            tulus. Prinsip ini menjadi fondasi setiap brand di bawah VIENXA
            Group.
          </p>
          <div className="values">
            <div>
              <strong>06</strong>
              <span>Unit usaha</span>
            </div>
            <div>
              <strong>01</strong>
              <span>Visi bersama</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>Peluang tumbuh</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <p className="eyebrow">Mari berkolaborasi</p>
        <h2>Punya gagasan untuk tumbuh bersama?</h2>
        <div className="contact-details">
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
            <span>WhatsApp</span>
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>
            <span>Email</span>
            {contact.email}
          </a>
        </div>
        <a
          className="primary-button"
          href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
            "Halo VIENXA Group, saya ingin berdiskusi mengenai kolaborasi.",
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          Mulai percakapan <Arrow />
        </a>
      </section>
    </main>
  );
}

function CheckoutModal({
  unit,
  cart,
  total,
  formatPrice,
  onClose,
  onQuantityChange,
  onComplete,
}: {
  unit: Unit;
  cart: CartItem[];
  total: number;
  formatPrice: (price: number) => string;
  onClose: () => void;
  onQuantityChange: (name: string, change: number) => void;
  onComplete: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [completed, setCompleted] = useState(false);
  const shipping = total >= 300000 ? 0 : 15000;
  const grandTotal = total + shipping;
  const orderNumber = `VNX-${Date.now().toString().slice(-6)}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompleted(true);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (completed) {
    const confirmationMessage = [
      `Halo VIENXA Group, saya sudah checkout di website ${unit.name}.`,
      `Nomor pesanan: ${orderNumber}`,
      `Total: ${formatPrice(grandTotal)}`,
      `Metode pembayaran: ${paymentMethod.toUpperCase()}`,
      "Mohon konfirmasi pesanan saya.",
    ].join("\n");

    return (
      <div className="checkout-overlay" role="dialog" aria-modal="true">
        <div className="checkout-success">
          <div className="success-mark">✓</div>
          <p className="eyebrow">Pesanan berhasil dibuat</p>
          <h2>Terima kasih atas pesanan Anda.</h2>
          <p>
            Nomor pesanan <strong>{orderNumber}</strong> telah tercatat. Tim
            VIENXA akan mengonfirmasi pembayaran dan detail pesanan Anda.
          </p>
          <div className="success-total">
            <span>Total pembayaran</span>
            <strong>{formatPrice(grandTotal)}</strong>
          </div>
          <a
            className="checkout-whatsapp"
            href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
              confirmationMessage,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Konfirmasi melalui WhatsApp <Arrow />
          </a>
          <button
            className="checkout-finish"
            onClick={() => {
              onComplete();
              onClose();
            }}
          >
            Selesai dan kembali berbelanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true">
      <div className="checkout-modal">
        <div className="checkout-topbar">
          <div>
            <span>VIENXA</span>
            <small>SECURE CHECKOUT</small>
          </div>
          <button onClick={onClose} aria-label="Tutup checkout">
            ×
          </button>
        </div>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-form">
            <div className="checkout-step">
              <span>01</span>
              <div>
                <h3>Informasi pembeli</h3>
                <p>Data ini digunakan untuk konfirmasi pesanan.</p>
              </div>
            </div>
            <div className="field-grid">
              <label>
                Nama lengkap
                <input name="name" placeholder="Nama penerima" required />
              </label>
              <label>
                Nomor WhatsApp
                <input
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </label>
              <label className="field-full">
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                />
              </label>
              <label className="field-full">
                Alamat / detail kebutuhan
                <textarea
                  name="address"
                  placeholder="Tuliskan alamat pengiriman atau detail kebutuhan layanan"
                  rows={3}
                  required
                />
              </label>
            </div>

            <div className="checkout-step payment-title">
              <span>02</span>
              <div>
                <h3>Metode pembayaran</h3>
                <p>Pilih metode pembayaran yang paling nyaman.</p>
              </div>
            </div>
            <div className="payment-options">
              <label className={paymentMethod === "qris" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="payment"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span className="payment-icon">QR</span>
                <span>
                  <strong>QRIS & E-Wallet</strong>
                  <small>GoPay, OVO, DANA, ShopeePay</small>
                </span>
                <i />
              </label>
              <label
                className={paymentMethod === "transfer" ? "is-selected" : ""}
              >
                <input
                  type="radio"
                  name="payment"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span className="payment-icon">BT</span>
                <span>
                  <strong>Transfer Bank</strong>
                  <small>Virtual account dan transfer manual</small>
                </span>
                <i />
              </label>
              <label
                className={paymentMethod === "confirmation" ? "is-selected" : ""}
              >
                <input
                  type="radio"
                  name="payment"
                  value="confirmation"
                  checked={paymentMethod === "confirmation"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span className="payment-icon">CS</span>
                <span>
                  <strong>Bayar Setelah Konfirmasi</strong>
                  <small>Cocok untuk pesanan khusus dan layanan</small>
                </span>
                <i />
              </label>
            </div>
          </div>

          <aside className="order-summary">
            <p className="eyebrow">Ringkasan pesanan</p>
            <h2>{unit.name}</h2>
            <div className="summary-items">
              {cart.map((item) => (
                <div className="summary-item" key={item.name}>
                  <div className="summary-thumb">{unit.icon}</div>
                  <div className="summary-info">
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}</span>
                    <small>{item.category}</small>
                    <p>{item.description}</p>
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.name, -1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.name, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div>
                <span>Pengiriman</span>
                <strong>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</strong>
              </div>
              <div className="grand-total">
                <span>Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>
            </div>
            <button className="pay-button" type="submit">
              Bayar di website <Arrow />
            </button>
            <p className="secure-note">
              Pembayaran aman · Data Anda terlindungi
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

function UnitSite({ unit, onBack }: { unit: Unit; onBack: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [unit]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => item.name === product.name);
      if (found) {
        return current.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const changeQuantity = (name: string, change: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  const checkoutMessage = [
    `Halo VIENXA Group, saya ingin memesan dari ${unit.name}:`,
    ...cart.map(
      (item) =>
        `- ${item.name} (${item.quantity}x) — ${formatPrice(item.price * item.quantity)}`,
    ),
    `Total: ${formatPrice(total)}`,
    "",
    "Mohon informasi langkah pemesanan selanjutnya.",
  ].join("\n");

  return (
    <main className="unit-site">
      <section className={`unit-hero unit-hero--${unit.id}`}>
        <div className="unit-hero-noise" />
        <div className="breadcrumb">
          <button onClick={onBack}>VIENXA Group</button>
          <span>/</span>
          <span>{unit.name}</span>
        </div>
        <div className="unit-hero-content">
          <div className="unit-large-icon">{unit.icon}</div>
          <p className="eyebrow">{unit.label} · A VIENXA COMPANY</p>
          <h1>{unit.name}</h1>
          <p>{unit.short}</p>
          <a
            className="primary-button"
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            Konsultasikan kebutuhan <Arrow />
          </a>
        </div>
        <span className="unit-watermark">VI</span>
      </section>

      <section className="unit-intro">
        <p className="eyebrow">Tentang kami</p>
        <div>
          <h2>{unit.description}</h2>
          <p>{unit.detail}</p>
        </div>
      </section>

      <section className="services-section">
        <p className="eyebrow">Yang kami hadirkan</p>
        <div className="service-list">
          {unit.services.map((service, index) => (
            <div key={service}>
              <span>0{index + 1}</span>
              <strong>{service}</strong>
              <i>↗</i>
            </div>
          ))}
        </div>
      </section>

      <section className="products-section">
        <div className="products-heading">
          <div>
            <p className="eyebrow">Pilihan untuk Anda</p>
            <h2>Produk & paket</h2>
          </div>
          <p>
            Pilih satu atau beberapa produk, lalu bayar langsung di website
            atau lanjutkan pemesanan melalui WhatsApp.
          </p>
        </div>
        <div className="product-grid">
          {unit.products.map((product, index) => (
            <article className="product-card" key={product.name}>
              <div className="product-visual">
                <span>0{index + 1}</span>
                <div>{unit.icon}</div>
              </div>
              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <div className="product-description">
                <small>Deskripsi produk</small>
                <p>{product.description}</p>
              </div>
              <div className="product-buy">
                <strong>{formatPrice(product.price)}</strong>
                <button onClick={() => addToCart(product)}>
                  Tambah <span>+</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {cart.length > 0 && (
        <aside
          className="cart-bar"
          aria-label="Rincian pesanan"
          aria-live="polite"
        >
          <div className="cart-heading">
            <div>
              <span>Rincian pesanan</span>
              <strong>
                {itemCount} {itemCount === 1 ? "produk" : "produk"} dipilih
              </strong>
            </div>
            <button onClick={() => setCart([])}>Kosongkan</button>
          </div>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.name}>
                <div className="cart-item-copy">
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </div>
                <div className="cart-item-meta">
                  <span>{item.quantity}×</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <span>Total pesanan</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="cart-actions">
            <button
              className="cart-checkout-button"
              onClick={() => setCheckoutOpen(true)}
            >
              Checkout website
            </button>
            <a
              href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                checkoutMessage,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Pesan via WhatsApp <Arrow />
            </a>
          </div>
        </aside>
      )}

      {checkoutOpen && cart.length > 0 && (
        <CheckoutModal
          unit={unit}
          cart={cart}
          total={total}
          formatPrice={formatPrice}
          onClose={() => setCheckoutOpen(false)}
          onQuantityChange={changeQuantity}
          onComplete={() => setCart([])}
        />
      )}

      <section className="back-section">
        <p>Bagian dari keluarga besar</p>
        <h2>VIENXA GROUP</h2>
        <button className="text-link" onClick={onBack}>
          ← Kembali ke portal utama
        </button>
      </section>
    </main>
  );
}

export default function App() {
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);

  const goHome = () => {
    setActiveUnit(null);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const goToUnits = () => {
    setActiveUnit(null);
    requestAnimationFrame(() =>
      document.getElementById("unit-usaha")?.scrollIntoView({ behavior: "smooth" }),
    );
  };

  return (
    <div className="app-shell">
      <Header
        onHome={goHome}
        onExplore={goToUnits}
        compact={Boolean(activeUnit)}
      />
      {activeUnit ? (
        <UnitSite unit={activeUnit} onBack={goHome} />
      ) : (
        <Home onSelect={setActiveUnit} />
      )}
      <footer>
        <button className="footer-brand" onClick={goHome}>
          VIENXA <span>GROUP</span>
        </button>
        <div className="footer-contact">
          <a href={`tel:${contact.phone.replace(/\s|-/g, "")}`}>{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
        <span>© 2026 VIENXA Group</span>
      </footer>
    </div>
  );
}
