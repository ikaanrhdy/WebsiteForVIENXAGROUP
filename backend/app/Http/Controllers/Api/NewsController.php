<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsController extends Controller
{
    /** Berita yang dipublikasikan, urutan terbaru dulu. */
    public function index(): AnonymousResourceCollection
    {
        return NewsResource::collection(
            News::with('author')->published()->orderBy('published_at', 'desc')->limit(10)->get()
        );
    }

    /** Detail satu berita untuk halaman lengkap. */
    public function show(string $slug): \Illuminate\Http\JsonResponse
    {
        $news = News::with('author')->published()->where('slug', $slug)->firstOrFail();

        return response()->json(new NewsResource($news));
    }
}