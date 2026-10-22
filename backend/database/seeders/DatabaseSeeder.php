<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\Order;
use App\Models\Package;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Akun demo — GANTI kata sandi sebelum dipakai di server sungguhan.
        User::updateOrCreate(['email' => 'admin@vienxa.test'], [
            'name' => 'Super Admin VIENXA',
            'phone' => null,
            'role' => User::ROLE_SUPER_ADMIN,
            'password' => 'password',
            'is_active' => true,
        ]);

        $buyer = User::updateOrCreate(['email' => 'user@vienxa.test'], [
            'name' => 'Pembeli Contoh',
            'phone' => '081234567890',
            'role' => User::ROLE_USER,
            'password' => 'password',
            'is_active' => true,
        ]);

        $packages = [
            ['Starter', 'Usaha kecil dan perorangan', ['Website 1-5 halaman', 'Desain responsif', 'Form kontak'], false],
            ['Business', 'UMKM, sekolah, organisasi', ['Website 6-10 halaman', 'Galeri dan katalog produk', 'Integrasi WhatsApp & media sosial', 'SEO dasar'], true],
            ['Custom', 'Kebutuhan khusus', ['Aplikasi dan sistem informasi', 'Dashboard admin', 'Fitur sesuai kebutuhan'], false],
        ];

        foreach ($packages as $i => [$name, $audience, $features, $featured]) {
            Package::updateOrCreate(['slug' => strtolower($name)], [
                'name' => $name,
                'audience' => $audience,
                'features' => $features,
                'featured' => $featured,
                'is_active' => true,
                'sort_order' => $i,
            ]);
        }

        // Berita contoh
        $news = [
            ['Luncurkan Layanan Website UMKM Terbaru', 'Kami meluncurkan paket website UMKM baru dengan fitur toko online dan integrasi WhatsApp.', '<p>VIENXA Web & IT resmi meluncurkan layanan website UMKM terbaru yang dilengkapi katalog produk, pemesanan lewat WhatsApp, dan desain responsif.</p>', 'berita-umkm.jpg'],
            ['Solusi Sistem Informasi untuk Sekolah', 'Sistem informasi akademik yang membantu sekolah dalam manajemen nilai, absensi, dan laporan.', '<p>Sistem informasi sekolah kini tersedia dengan modul nilai digital, absensi siswa, dan laporan otomatis untuk guru dan orang tua.</p>', 'sistem-informasi-sekolah.jpg'],
            ['Tips Keamanan Website untuk Bisnis Kecil', 'Cara sederhana melindungi website usaha dari ancaman siber dan malware.', '<p>Berikut tips praktis untuk menjaga keamanan website bisnis Anda, mulai dari SSL certificate hingga backup rutin.</p>', 'keamanan-website.jpg'],
        ];

        $admin = User::where('role', User::ROLE_SUPER_ADMIN)->first();

        foreach ($news as [$title, $excerpt, $content, $image]) {
            News::updateOrCreate(['slug' => \Illuminate\Support\Str::slug($title)], [
                'title' => $title,
                'excerpt' => $excerpt,
                'content' => $content,
                'image' => $image,
                'is_published' => true,
                'published_at' => now()->subDays(rand(1, 30)),
                'created_by' => $admin?->id,
            ]);
        }

        // Produk jual beli teknologi contoh
        $products = [
            ['Laptop Asus Vivobook 14', 'Elektronik', 'Laptop untuk kantor dan sekolah, RAM 8GB, SSD 512GB.', 7500000, 10, 'laptop-asus.jpg'],
            ['Mouse Logitech M190', 'Elektronik', 'Mouse nirkabel ergonomis untuk penggunaan sehari-hari.', 150000, 50, 'mouse-logitech.jpg'],
            ['Aplikasi Kasir Toko (POS)', 'Software', 'Sistem kasir toko offline dan online dengan laporan harian.', 1200000, 100, 'aplikasi-kasir.jpg'],
            ['Hosting + Domain .id 1 Tahun', 'Teknologi', 'Paket hosting dan domain .id untuk website UMKM.', 350000, 200, 'hosting-domain.jpg'],
        ];

        foreach ($products as [$name, $category, $description, $price, $stock, $image]) {
            Product::updateOrCreate(['slug' => \Illuminate\Support\Str::slug($name)], [
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'price' => $price,
                'stock' => $stock,
                'image' => $image,
                'is_active' => true,
                'is_featured' => $price > 1000000,
                'created_by' => $admin?->id,
            ]);
        }

        // Contoh pesanan agar dashboard tidak kosong (hanya dibuat sekali).
        if (! $buyer->orders()->exists()) {
            $business = Package::where('slug', 'business')->first();
            $starter = Package::where('slug', 'starter')->first();

            $buyer->orders()->create([
                'package_id' => $business->id,
                'project_name' => 'Website Toko Kue',
                'description' => 'Katalog produk dan pemesanan lewat WhatsApp.',
                'status' => Order::PROCESSING,
                'amount' => 2500000,
                'admin_notes' => 'Desain sedang dikerjakan.',
            ]);
            $buyer->orders()->create([
                'package_id' => $starter->id,
                'project_name' => 'Company Profile Sekolah',
                'description' => 'Profil sekolah, galeri kegiatan, dan kontak.',
                'status' => Order::PENDING,
            ]);
        }
    }
}
