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
    public function index(): AnonymousResourceCollection
    {
        return NewsResource::collection(
            News::with('author')->orderByDesc('created_at')->get()
        );
    }

    public function store(NewsRequest $request): JsonResponse
    {
        $news = News::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return (new NewsResource($news->load('author')))->response()->setStatusCode(201);
    }

    public function update(NewsRequest $request, News $news): NewsResource
    {
        $news->update($request->validated());

        return new NewsResource($news->load('author'));
    }

    public function destroy(News $news): JsonResponse
    {
        $news->delete();

        return response()->json(null, 204);
    }
}
