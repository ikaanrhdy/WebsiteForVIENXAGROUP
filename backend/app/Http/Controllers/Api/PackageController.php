<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Daftar paket yang tampil di halaman publik Web & IT. */
class PackageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PackageResource::collection(Package::active()->orderBy('sort_order')->orderBy('id')->get());
    }
}
