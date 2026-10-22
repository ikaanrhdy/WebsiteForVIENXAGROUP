<?php

// Mengizinkan frontend React (Vite) memanggil API ini dari origin berbeda.
// Atur FRONTEND_URL di .env, pisahkan dengan koma jika lebih dari satu.
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173'))))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // autentikasi memakai Bearer token, bukan cookie
];
