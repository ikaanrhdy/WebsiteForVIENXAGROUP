<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $orders = $request->user()->orders();
        $byStatus = (clone $orders)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return response()->json([
            'stats' => [
                'total' => (int) $byStatus->sum(),
                'pending' => (int) ($byStatus[Order::PENDING] ?? 0),
                'processing' => (int) ($byStatus[Order::PROCESSING] ?? 0),
                'done' => (int) ($byStatus[Order::DONE] ?? 0),
            ],
            'recent_orders' => OrderResource::collection(
                (clone $orders)->with('package')->latest()->limit(5)->get()
            )->resolve(),
        ]);
    }
}
