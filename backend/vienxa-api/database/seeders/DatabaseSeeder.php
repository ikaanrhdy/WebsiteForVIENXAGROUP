<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Package;
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
