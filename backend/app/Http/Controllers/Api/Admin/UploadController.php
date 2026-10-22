<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:super_admin']);
    }

    /** Menerima base64 image, simpan ke storage/app/public/uploads, kembalikan URL. */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'string'], // data URL base64
            'folder' => ['nullable', 'string', 'in:news,products'],
        ]);

        $data = $request->image;
        $folder = $request->folder ?? 'uploads';

        if (! preg_match('/^data:image\/(\w+);base64,/', $data, $m)) {
            return response()->json(['message' => 'Format gambar tidak valid.'], 422);
        }

        $ext = $m[1];
        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $data);
        $binary = base64_decode($base64);

        if ($binary === false) {
            return response()->json(['message' => 'Gagal mendekode gambar.'], 422);
        }

        $filename = Str::random(16) . '.' . $ext;
        $path = "{$folder}/{$filename}";

        Storage::disk('public')->put($path, $binary);

        return response()->json([
            'url' => url('storage/' . $path),
            'path' => $path,
        ]);
    }
}