<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'folder' => ['required', 'string', 'in:news,products'],
        ]);

        $path = $request->file('image')->store($validated['folder'], 'public');

        return response()->json(['path' => $path]);
    }
}
