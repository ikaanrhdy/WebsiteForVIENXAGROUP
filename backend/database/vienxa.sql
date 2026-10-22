-- =============================================================================
-- VIENXA GROUP — Database MySQL (Laravel 11/12 + Sanctum)
-- Tabel untuk: Users, Packages, Orders, News, Products, Cart, Sales Chat, Notifications
-- =============================================================================

DROP TABLE IF EXISTS `app_notifications`;
DROP TABLE IF EXISTS `sales_chat_messages`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `packages`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `phone` varchar(30) DEFAULT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `packages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `audience` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `features` json DEFAULT NULL,
  `price` bigint UNSIGNED DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `packages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `package_id` bigint UNSIGNED DEFAULT NULL,
  `code` varchar(24) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'menunggu',
  `amount` bigint UNSIGNED DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_code_unique` (`code`),
  KEY `orders_status_index` (`status`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_package_id_foreign` (`package_id`),
  CONSTRAINT `orders_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `news` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_unique` (`slug`),
  KEY `news_is_published_published_at_index` (`is_published`, `published_at`),
  KEY `news_created_by_foreign` (`created_by`),
  CONSTRAINT `news_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'web-it',
  `price` bigint UNSIGNED DEFAULT NULL,
  `stock` int UNSIGNED NOT NULL DEFAULT '0',
  `image` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_is_active_category_created_at_index` (`is_active`, `category`, `created_at`),
  KEY `products_unit_index` (`unit`),
  KEY `products_created_by_foreign` (`created_by`),
  CONSTRAINT `products_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `cart_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_user_id_product_id_unique` (`user_id`, `product_id`),
  CONSTRAINT `cart_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'web-it',
  `unit_price` bigint UNSIGNED DEFAULT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `product_reviews` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_reviews_product_id_user_id_unique` (`product_id`, `user_id`),
  KEY `product_reviews_product_id_created_at_index` (`product_id`, `created_at`),
  CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sales_chat_messages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_chat_customer_created_index` (`customer_id`, `created_at`),
  CONSTRAINT `sales_chat_customer_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_chat_sender_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `app_notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `audience` varchar(20) NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_notifications_audience_index` (`audience`),
  KEY `app_notifications_audience_user_read_index` (`audience`, `user_id`, `read_at`),
  CONSTRAINT `app_notifications_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- =============================================================================
-- DATA AWAL (Seeder)
-- =============================================================================

INSERT INTO `users` (`name`, `email`, `role`, `phone`, `is_active`, `password`, `created_at`, `updated_at`) VALUES
('Super Admin VIENXA', 'admin@vienxa.test', 'super_admin', NULL, 1, '$2y$12$LQv3c1yqBWVHxEg0LyaKYOe.Rrq5TP9xjYyJr6XK7XnE2lJ8k3qPu', NOW(), NOW()),
('Pembeli Contoh', 'user@vienxa.test', 'user', '081234567890', 1, '$2y$12$LQv3c1yqBWVHxEg0LyaKYOe.Rrq5TP9xjYyJr6XK7XnE2lJ8k3qPu', NOW(), NOW());

INSERT INTO `packages` (`name`, `slug`, `audience`, `description`, `features`, `price`, `featured`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('Starter', 'starter', 'Usaha kecil dan perorangan', 'Paket website untuk usaha kecil dengan fitur dasar.', '[\"Website 1-5 halaman\", \"Desain responsif\", \"Form kontak\"]', NULL, 0, 1, 0, NOW(), NOW()),
('Business', 'business', 'UMKM, sekolah, organisasi', 'Paket website lengkap untuk UMKM dan organisasi.', '[\"Website 6-10 halaman\", \"Galeri dan katalog produk\", \"Integrasi WhatsApp & media sosial\", \"SEO dasar\"]', NULL, 1, 1, 1, NOW(), NOW()),
('Custom', 'custom', 'Kebutuhan khusus', 'Paket sesuai kebutuhan spesifik klien.', '[\"Aplikasi dan sistem informasi\", \"Dashboard admin\", \"Fitur sesuai kebutuhan\"]', NULL, 0, 1, 2, NOW(), NOW());

INSERT INTO `news` (`title`, `slug`, `excerpt`, `content`, `image`, `is_published`, `published_at`, `created_by`, `created_at`, `updated_at`) VALUES
('Luncurkan Layanan Website UMKM Terbaru', 'luncurkan-layanan-website-umkm-terbaru', 'Kami meluncurkan paket website UMKM baru dengan fitur toko online dan integrasi WhatsApp.', '<p>VIENXA Web & IT resmi meluncurkan layanan website UMKM terbaru yang dilengkapi katalog produk, pemesanan lewat WhatsApp, dan desain responsif.</p>', 'berita-umkm.jpg', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 1, NOW(), NOW()),
('Solusi Sistem Informasi untuk Sekolah', 'solusi-sistem-informasi-untuk-sekolah', 'Sistem informasi akademik yang membantu sekolah dalam manajemen nilai, absensi, dan laporan.', '<p>Sistem informasi sekolah kini tersedia dengan modul nilai digital, absensi siswa, dan laporan otomatis untuk guru dan orang tua.</p>', 'sistem-informasi-sekolah.jpg', 1, DATE_SUB(NOW(), INTERVAL 12 DAY), 1, NOW(), NOW()),
('Tips Keamanan Website untuk Bisnis Kecil', 'tips-keamanan-website-untuk-bisnis-kecil', 'Cara sederhana melindungi website usaha dari ancaman siber dan malware.', '<p>Berikut tips praktis untuk menjaga keamanan website bisnis Anda, mulai dari SSL certificate hingga backup rutin.</p>', 'keamanan-website.jpg', 1, DATE_SUB(NOW(), INTERVAL 20 DAY), 1, NOW(), NOW());

INSERT INTO `products` (`name`, `slug`, `description`, `category`, `price`, `stock`, `image`, `is_active`, `is_featured`, `created_by`, `created_at`, `updated_at`) VALUES
('Laptop Asus Vivobook 14', 'laptop-asus-vivobook-14', 'Laptop untuk kantor dan sekolah, RAM 8GB, SSD 512GB.', 'Elektronik', 7500000, 10, 'laptop-asus.jpg', 1, 1, 1, NOW(), NOW()),
('Mouse Logitech M190', 'mouse-logitech-m190', 'Mouse nirkabel ergonomis untuk penggunaan sehari-hari.', 'Elektronik', 150000, 50, 'mouse-logitech.jpg', 1, 0, 1, NOW(), NOW()),
('Aplikasi Kasir Toko (POS)', 'aplikasi-kasir-toko-pos', 'Sistem kasir toko offline dan online dengan laporan harian.', 'Software', 1200000, 100, 'aplikasi-kasir.jpg', 1, 1, 1, NOW(), NOW()),
('Hosting + Domain .id 1 Tahun', 'hosting-domain-id-1-tahun', 'Paket hosting dan domain .id untuk website UMKM.', 'Teknologi', 350000, 200, 'hosting-domain.jpg', 1, 1, 1, NOW(), NOW());

INSERT INTO `orders` (`user_id`, `package_id`, `code`, `project_name`, `description`, `status`, `amount`, `admin_notes`, `created_at`, `updated_at`) VALUES
(2, 2, 'VX-261017-ABCD', 'Website Toko Kue', 'Katalog produk dan pemesanan lewat WhatsApp.', 'diproses', 2500000, 'Desain sedang dikerjakan.', NOW(), NOW()),
(2, 1, 'VX-261017-EFGH', 'Company Profile Sekolah', 'Profil sekolah, galeri kegiatan, dan kontak.', 'menunggu', NULL, NULL, NOW(), NOW());

-- =============================================================================
-- CATATAN PENTING
-- =============================================================================
-- 1. Jalankan: mysql -u root -p vienxa < vienxa.sql
-- 2. Jalankan: php artisan storage:link (agar gambar accessible via URL)
-- 3. Akun demo: admin@vienxa.test / password (Super Admin)
-- 4. Akun demo: user@vienxa.test / password (User)
-- 5. Ganti kata sandi sebelum produksi!
-- =============================================================================