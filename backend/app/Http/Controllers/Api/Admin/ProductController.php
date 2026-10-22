<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /** Daftar produk jual beli teknologi untuk super admin. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('creator')->orderBy('created_at', 'desc');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('unit')) {
            $query->where('unit', $request->unit);
        }
        if ($request->boolean('active_only')) {
            $query->active();
        }

        return ProductResource::collection($query->get());
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return (new ProductResource($product->load('creator')))->response()->setStatusCode(201);
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        return new ProductResource($product->load('creator'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(null, 204);
    }
}