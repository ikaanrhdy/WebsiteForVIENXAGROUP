<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsController extends Controller
{
    // Untuk menampilkan daftar berita (GET)
    public function index(): AnonymousResourceCollection
    {
        return NewsResource::collection(
            News::with('author')->orderBy('created_at', 'desc')->get()
        );
    }

    // Untuk menyimpan berita baru (POST)
    public function store(NewsRequest $request): JsonResponse
    {
        $news = News::create(array_merge(
            $request->validated(),
            ['created_by' => auth()->id()]
        ));

        return (new NewsResource($news))->response()->setStatusCode(201);
    }

    // Untuk mengupdate berita (PUT/PATCH)
    public function update(NewsRequest $request, News $news): NewsResource
    {
        $news->update($request->validated());

        return new NewsResource($news->load('author'));
    }

    // Untuk menghapus berita (DELETE)
    public function destroy(News $news): JsonResponse
    {
        $news->delete();

        return response()->json(null, 204);
    }
}


