<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Lokasi folder Laravel (di luar public_html)
$app_path = __DIR__.'/../vienxa-api';

if (file_exists($maintenance = $app_path.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $app_path.'/vendor/autoload.php';

$app = require_once $app_path.'/bootstrap/app.php';

$app->handleRequest(Request::capture());