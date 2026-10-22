<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\AppNotification;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()->cartItems()->with('product')->get()->map(fn ($item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'product' => $item->product,
            'line_total' => $item->product->price === null ? null : $item->product->price * $item->quantity,
        ]);

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);
        $product = Product::active()->findOrFail($data['product_id']);
        if ($product->stock < $data['quantity']) {
            throw ValidationException::withMessages(['quantity' => ['Jumlah melebihi stok yang tersedia.']]);
        }
        $item = $request->user()->cartItems()->firstOrNew(['product_id' => $product->id]);
        $quantity = $item->exists ? $item->quantity + $data['quantity'] : $data['quantity'];
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages(['quantity' => ['Jumlah keranjang melebihi stok yang tersedia.']]);
        }
        $item->quantity = $quantity;
        $item->save();

        return response()->json(['message' => 'Produk ditambahkan ke keranjang.', 'id' => $item->id], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:1000']]);
        $item = $request->user()->cartItems()->with('product')->findOrFail($id);
        if (! $item->product->is_active || $data['quantity'] > $item->product->stock) {
            throw ValidationException::withMessages(['quantity' => ['Jumlah melebihi stok yang tersedia.']]);
        }
        $item->update($data);

        return response()->json(['message' => 'Keranjang diperbarui.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $request->user()->cartItems()->findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'project_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
        ]);
        $user = $request->user();
        $order = DB::transaction(function () use ($user, $data) {
            $cartItems = $user->cartItems()->with('product')->lockForUpdate()->get();
            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages(['cart' => ['Keranjang masih kosong.']]);
            }
            $total = 0;
            $hasUnpricedItems = false;
            $lockedProducts = [];
            foreach ($cartItems as $cartItem) {
                $product = Product::whereKey($cartItem->product_id)->lockForUpdate()->firstOrFail();
                if (! $product->is_active || $cartItem->quantity > $product->stock) {
                    throw ValidationException::withMessages(['cart' => ["Stok {$product->name} tidak mencukupi."]]);
                }
                $lockedProducts[] = [$cartItem, $product];
                if ($product->price === null) {
                    $hasUnpricedItems = true;
                } else {
                    $total += $product->price * $cartItem->quantity;
                }
            }
            $order = $user->orders()->create([
                'project_name' => $data['project_name'] ?? 'Pesanan produk',
                'description' => $data['description'] ?? 'Pesanan produk melalui keranjang.',
                'amount' => $hasUnpricedItems ? null : $total,
            ]);
            foreach ($lockedProducts as [$cartItem, $product]) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit' => $product->unit,
                    'unit_price' => $product->price,
                    'quantity' => $cartItem->quantity,
                ]);
                $product->decrement('stock', $cartItem->quantity);
            }
            $user->cartItems()->delete();
            AppNotification::create([
                'audience' => 'admin',
                'title' => 'Pesanan produk baru',
                'message' => "{$user->name} membuat pesanan {$order->code}.",
                'link' => '/admin/pesanan',
            ]);
            AppNotification::create([
                'audience' => 'user',
                'user_id' => $user->id,
                'title' => 'Pesanan diterima',
                'message' => "Pesanan {$order->code} sudah diterima dan menunggu konfirmasi.",
                'link' => '/dashboard/pesanan',
            ]);

            return $order->load(['package', 'items']);
        });

        return response()->json(['data' => new OrderResource($order)], 201);
    }
}
