<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductReviewController extends Controller
{
    public function store(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'review' => ['nullable', 'string', 'max:2000'],
        ]);

        $order = $request->user()->orders()
            ->where('status', Order::DONE)
            ->whereHas('items', fn ($items) => $items->where('product_id', $product->id))
            ->latest()
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'review' => ['Ulasan hanya dapat diberikan setelah pesanan produk selesai.'],
            ]);
        }

        $review = $product->reviews()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['order_id' => $order->id, ...$data]
        );

        return response()->json([
            'message' => 'Ulasan produk berhasil disimpan.',
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review' => $review->review,
            ],
        ], $review->wasRecentlyCreated ? 201 : 200);
    }
}
