<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\News;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    public function __invoke(): JsonResponse
    {
        $byStatus = Order::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $monthly = collect(range(5, 0))->map(function (int $ago) {
            $start = now()->startOfMonth()->subMonths($ago);

            return [
                'label' => self::MONTHS[$start->month - 1],
                'count' => Order::whereBetween('created_at', [$start, $start->copy()->endOfMonth()])->count(),
            ];
        })->values();

        return response()->json([
            'stats' => [
                'users' => User::where('role', User::ROLE_USER)->count(),
                'orders' => (int) $byStatus->sum(),
                'pending' => (int) ($byStatus[Order::PENDING] ?? 0),
                'processing' => (int) ($byStatus[Order::PROCESSING] ?? 0),
                'done' => (int) ($byStatus[Order::DONE] ?? 0),
                'cancelled' => (int) ($byStatus[Order::CANCELLED] ?? 0),
                'revenue' => (int) Order::where('status', Order::DONE)->sum('amount'),
                'news' => News::count(),
                'products' => Product::count(),
            ],
            'monthly' => $monthly,
            'recent_orders' => OrderResource::collection(
                Order::with(['user', 'package'])->latest()->limit(5)->get()
            )->resolve(),
        ]);
    }
}
