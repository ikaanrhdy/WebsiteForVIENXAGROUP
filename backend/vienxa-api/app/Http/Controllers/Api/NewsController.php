<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return NewsResource::collection(
            News::with('author')->published()->orderByDesc('published_at')->limit(10)->get()
        );
    }

    public function show(string $slug): JsonResponse
    {
        $news = News::with('author')->published()->where('slug', $slug)->firstOrFail();

        return response()->json(new NewsResource($news));
    }
}
