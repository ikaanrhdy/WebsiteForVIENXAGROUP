# VIENXA GROUP — Web & IT (Frontend React + Backend Laravel)

```
vienxa/
├── frontend/   React + Vite (halaman utama, halaman Web & IT, login, 2 dashboard)
└── backend/    Kode Laravel (app, routes, migrations, seeder) — ditimpa ke proyek Laravel baru
```

## 1. Backend (Laravel 11/12 + Sanctum)
Butuh PHP 8.2+ dan Composer.

```bash
composer create-project laravel/laravel vienxa-api
cd vienxa-api
php artisan install:api          # memasang Laravel Sanctum + routes/api.php
```
Salin **isi** folder `backend/` ke dalam `vienxa-api/` (timpa jika diminta):
- Linux/macOS: `cp -r ../backend/. .`
- Windows: `xcopy ..\backend\* . /E /Y`

Tambahkan isi `backend/.env.additions` ke `.env`, lalu:
```bash
php artisan migrate:fresh --seed
php artisan serve                # http://localhost:8000
```
Database bawaan Laravel adalah SQLite (tanpa setup). Untuk MySQL, ubah `DB_*` di `.env` sebelum `migrate`.

### Akun demo (dibuat seeder — ganti sebelum produksi)
| Peran | Email | Kata sandi |
|---|---|---|
| Super Admin | `admin@vienxa.test` | `password` |
| User (pembeli) | `user@vienxa.test` | `password` |

## 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env             # Windows: copy .env.example .env
npm run dev                      # http://localhost:5173
```

## 3. Cara frontend terhubung ke backend
1. `frontend/.env` → `VITE_API_URL=http://localhost:8000/api` (alamat API Laravel).
2. `src/lib/api.js` memanggil `fetch` ke alamat itu dan menyertakan header `Authorization: Bearer <token>`.
3. Login `POST /api/auth/login` → Laravel mengembalikan `{ user, token }`. Token disimpan di `localStorage`.
4. Frontend membaca `user.role`: `super_admin` → `/admin`, `user` → `/dashboard`.
5. Backend menjaga akses lagi lewat middleware `auth:sanctum` + `role:...`, jadi user biasa yang membuka URL admin tetap ditolak (403) walau frontend dilewati.
6. CORS: `config/cors.php` mengizinkan origin di `FRONTEND_URL`. Saat deploy, isi `FRONTEND_URL` dengan domain frontend dan `VITE_API_URL` dengan domain API sebelum `npm run build`.

## Endpoint API
| Metode | URL | Akses |
|---|---|---|
| GET | `/api/packages` | publik |
| GET | `/api/products?unit=bakery&featured=1` | publik |
| GET | `/api/products/{id}` | publik |
| POST | `/api/auth/register`, `/api/auth/login` | publik |
| POST/GET/PUT | `/api/auth/logout`, `/api/auth/me`, `/api/auth/profile` | login |
| GET/POST | `/api/notifications`, `/api/notifications/read-all`, `/api/notifications/{id}/read` | login |
| GET | `/api/admin/dashboard` | super admin |
| GET/PUT/DELETE | `/api/admin/users[/{id}]` | super admin |
| GET/PUT | `/api/admin/orders[/{id}]` | super admin |
| GET/POST/PUT/DELETE | `/api/admin/packages[/{id}]` | super admin |
| GET/POST/PUT/DELETE | `/api/admin/products[/{id}]` | super admin |
| GET | `/api/me/dashboard` | user |
| POST | `/api/me/products/{id}/reviews` | user (pembeli dengan pesanan selesai) |
| GET/POST | `/api/me/orders` | user |
| POST | `/api/me/orders/{id}/cancel` | user |
| GET/POST | `/api/me/pengadaan` | user |
| GET/PUT | `/api/admin/pengadaan[/{id}]` | super admin |
| GET/POST/PUT/DELETE | `/api/me/cart` dan `/api/me/cart/items[/{id}]` | user |
| POST | `/api/me/cart/checkout` | user |
| GET/POST | `/api/me/sales-chat` | user |
| GET | `/api/admin/sales-chat/conversations` | super admin |
| GET/POST | `/api/admin/sales-chat/{userId}/messages` | super admin |

## Isi dashboard
- **Super Admin:** statistik (pembeli, pesanan, menunggu, nilai pesanan selesai), grafik pesanan 6 bulan, kelola pesanan (status, nilai, catatan), kelola pengguna (aktif/nonaktif/hapus), kelola paket layanan.
- **User/Pembeli:** ringkasan pesanan sendiri, pesan paket Web & IT, riwayat & detail pesanan (bisa dibatalkan selagi "menunggu"), profil.
- Kedua dashboard memakai tema gelap; pembeli bisa mengelola keranjang, checkout, dan chat penjualan. Admin mengelola pesanan dan membalas chat.
- **Pengadaan:** user mengirim pengajuan dan memantau status; super admin meninjau lalu menyetujui/menolak. Pengajuan ini terpisah dari pesanan paket dan keranjang.
- Template Surat Pesanan, BAST, gambar BAST, SHP, invoice, dan kuitansi tersedia untuk super admin setelah pengajuan disetujui. Format A4 berlogo VIENXA mengikuti susunan dokumen contoh; data instansi, jumlah, dan detail barang terisi dari pengajuan. Foto BAST dapat ditambahkan sebelum mencetak/menyimpan PDF melalui browser. Kolom penyedia, nilai kesepakatan, pajak, pembayaran, dan tanda tangan tetap perlu dilengkapi secara manual. E-meterai dan tanda tangan elektronik belum terintegrasi.

## Catatan
- Pendaftaran publik selalu menjadi role `user`; super admin hanya dibuat lewat seeder/database.
- Harga paket belum ada di data awal, jadi dikosongkan ("sesuai penawaran"); isi dari menu Paket Layanan.
- Daftar pesanan/pengguna belum dipaginasi (cukup untuk skala awal).

## Fitur Baru
- Logo bulat & timbul di footer (`.footer-logo`)
- Tombol mata toggle password di halaman login
- Halaman `/berita` untuk semua berita + berita terbaru di beranda
- Manajemen berita (CRUD) di dashboard super admin dengan foto
- Produk per unit usaha, landing page masing-masing unit, dan daftar best seller di beranda
- Manajemen produk lintas unit usaha di dashboard super admin, termasuk video/foto Content Creator
- Edit profil dan kata sandi untuk super admin maupun pembeli
- Unggah foto profil JPG/PNG/WebP (maksimal 2 MB) dari menu profil
- Keranjang tersimpan di database; checkout mencatat item pesanan dan memperbarui stok
- Chat penjualan dan notifikasi pesanan/pesan tersimpan, dengan tanda sudah dibaca
- Tombol mata untuk menampilkan kata sandi pada form pendaftaran pembeli
- Statistik berita & produk di dashboard super admin
- Pengajuan dan konfirmasi pengadaan terpisah untuk user dan super admin, dengan template dokumen A4 berlogo VIENXA
- Live chat di halaman beranda dan dashboard user
- Upload gambar base64 via `/api/admin/upload/image`

Produk memiliki kolom `unit` (`daopurku-catering`, `bakery`, `thrifting`, `advertising`,
`affiliate`, `content-creator`, atau `web-it`) dan kolom opsional `video_url`.
Produk lama otomatis dianggap sebagai produk Web & IT. Untuk API publik, gunakan
`GET /api/products?unit=bakery` untuk memfilter unit atau tambahkan `&featured=1`
untuk hanya mengambil produk unggulan. Jalankan `php artisan migrate --force`
setelah memperbarui backend agar migrasi produk baru diterapkan.

Jalankan `php artisan migrate --force` setelah memperbarui backend untuk membuat tabel
pengajuan pengadaan dan menambahkan kolom identitas instansi/satuan barang yang digunakan
pada dokumen cetak.

Detail produk menyajikan rating rata-rata, jumlah ulasan, jumlah unit terjual dari
pesanan berstatus `selesai`, dan hingga 20 ulasan terbaru. Pembeli hanya dapat
memberi atau memperbarui satu ulasan produk setelah memiliki pesanan produk tersebut
dengan status selesai.

## Deployment ke Hosting
1. Upload backend ke folder di luar `public_html`, frontend `dist/` ke `public_html`.
2. Buat database MySQL, atur `.env` (APP_DEBUG=false, DB_* MySQL, APP_URL domain).
3. Jalankan: `composer install --optimize-autoloader --no-dev`, `php artisan key:generate`, `php artisan migrate --force`, `php artisan db:seed --force`, `php artisan storage:link`.
4. Edit `frontend/.env`: `VITE_API_URL=https://domain-api.com/api`, lalu `npm run build`.
5. Upload `.htaccess` dan isi `dist/` ke `public_html`.
6. Ganti kata sandi akun demo sebelum produksi.
