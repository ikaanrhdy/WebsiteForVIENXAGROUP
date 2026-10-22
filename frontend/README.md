# VIENXA GROUP — Frontend (React + Vite)

## Menjalankan
```
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```
Buka http://localhost:5173. Backend Laravel harus berjalan di alamat pada `VITE_API_URL` (bawaan `http://localhost:8000/api`).

## Halaman
| URL | Isi |
|---|---|
| `/` | Halaman utama grup (bagian Web & IT kini hanya ringkasan + tautan) |
| `/web-it` | Halaman Web & IT terpisah: layanan, paket, alur kerja, tombol **Login** |
| `/login`, `/register` | Masuk / daftar sebagai pembeli |
| `/admin/*` | Dashboard **Super Admin** (hanya role `super_admin`) |
| `/dashboard/*` | Dashboard **User/Pembeli** (hanya role `user`) |

## Struktur
- `src/lib/api.js` — satu-satunya klien HTTP ke Laravel (token Bearer di localStorage)
- `src/context/AuthContext.jsx` — login, register, logout, data user
- `src/components/ProtectedRoute.jsx` — penjaga halaman berdasarkan role
- `src/pages/` — Landing, WebIT, Login, Register
- `src/admin/super/` dan `src/admin/user/` — halaman dua dashboard
- `src/dashboard.css` — gaya dashboard (sidebar gelap, kartu statistik ala CoreUI)
- `src/data.js` — teks situs (dipakai juga sebagai data cadangan jika backend mati)
