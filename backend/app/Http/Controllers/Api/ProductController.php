<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /** Produk teknologi aktif untuk halaman Web & IT dan dashboard user. */
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProductResource::collection(
            $this->withProductStats(Product::active())
                ->when($request->filled('unit'), fn ($query) => $query->where('unit', $request->query('unit')))
                ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
                ->orderByDesc('is_featured')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function show(int $id): JsonResponse
    {
        $product = $this->withProductStats(Product::active())
            ->with(['reviews' => fn ($query) => $query->with('user:id,name')->latest()->limit(20)])
            ->findOrFail($id);

        return response()->json([
            'data' => array_merge((new ProductResource($product))->resolve(), [
                'reviews' => $product->reviews->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'review' => $review->review,
                    'created_at' => $review->created_at,
                    'user' => ['name' => $review->user->name],
                ])->values(),
            ]),
        ]);
    }

    private function withProductStats(Builder $query): Builder
    {
        return $query
            ->withSum(['orderItems as sold_count' => fn ($items) => $items->whereHas(
                'order',
                fn ($orders) => $orders->where('status', Order::DONE)
            )], 'quantity')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');
    }
}