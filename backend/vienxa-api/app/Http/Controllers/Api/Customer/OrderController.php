<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\AppNotification;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/** Semua query dibatasi ke pesanan milik user yang sedang login. */
class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection($request->user()->orders()->with(['package', 'items'])->latest()->get());
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $request->user()->orders()->create($request->validated());
        AppNotification::create([
            'audience' => 'admin',
            'title' => 'Pesanan baru',
            'message' => "{$request->user()->name} mengirim pesanan {$order->code}.",
            'link' => '/admin/pesanan',
        ]);
        AppNotification::create([
            'audience' => 'user',
            'user_id' => $request->user()->id,
            'title' => 'Pesanan diterima',
            'message' => "Pesanan {$order->code} sudah diterima.",
            'link' => '/dashboard/pesanan',
        ]);

        return (new OrderResource($order->load(['package', 'items'])))->response()->setStatusCode(201);
    }

    public function cancel(Request $request, int $id): OrderResource|JsonResponse
    {
        $result = DB::transaction(function () use ($request, $id) {
            $order = $request->user()->orders()->lockForUpdate()->findOrFail($id);
            if ($order->status !== Order::PENDING) {
                return response()->json(['message' => 'Hanya pesanan berstatus "menunggu" yang dapat dibatalkan.'], 422);
            }
            $order->update(['status' => Order::CANCELLED]);
            foreach ($order->items()->whereNotNull('product_id')->get() as $item) {
                $item->product()->increment('stock', $item->quantity);
            }

            return $order->load(['package', 'items']);
        });
        if ($result instanceof JsonResponse) {
            return $result;
        }

        AppNotification::create([
            'audience' => 'admin',
            'title' => 'Pesanan dibatalkan',
            'message' => "{$request->user()->name} membatalkan pesanan {$result->code}.",
            'link' => '/admin/pesanan',
        ]);

        return new OrderResource($result);
    }
}
