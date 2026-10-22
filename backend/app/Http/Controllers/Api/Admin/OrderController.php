<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\AppNotification;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /** GET /api/admin/orders?status=menunggu */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::with(['user', 'package', 'items'])
            ->when(
                in_array($request->query('status'), Order::STATUSES, true),
                fn ($q) => $q->where('status', $request->query('status'))
            )
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        $changes = $request->validated();
        $order = DB::transaction(function () use ($order, $changes) {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $previousStatus = $order->status;
            $order->update($changes);
            if ($previousStatus !== Order::CANCELLED && $order->status === Order::CANCELLED) {
                foreach ($order->items()->whereNotNull('product_id')->get() as $item) {
                    $item->product()->increment('stock', $item->quantity);
                }
            }

            return $order->load(['user', 'package', 'items']);
        });
        if ($order->wasChanged('status')) {
            AppNotification::create([
                'audience' => 'user',
                'user_id' => $order->user_id,
                'title' => 'Status pesanan diperbarui',
                'message' => "Pesanan {$order->code} sekarang berstatus {$order->status}.",
                'link' => '/dashboard/pesanan',
            ]);
        }

        return new OrderResource($order);
    }
}
