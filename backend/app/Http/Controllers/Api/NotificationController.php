<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\SalesChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = AppNotification::where('audience', $user->isSuperAdmin() ? 'admin' : 'user')
            ->when(! $user->isSuperAdmin(), fn ($q) => $q->where('user_id', $user->id));
        $chatUnread = SalesChatMessage::whereNull('read_at')
            ->when(
                $user->isSuperAdmin(),
                fn ($q) => $q->whereColumn('sender_id', 'customer_id'),
                fn ($q) => $q->where('customer_id', $user->id)->where('sender_id', '!=', $user->id)
            )
            ->count();

        return response()->json([
            'unread_count' => (clone $query)->whereNull('read_at')->count(),
            'chat_unread_count' => $chatUnread,
            'data' => $query->latest()->limit(30)->get(),
        ]);
    }

    public function read(Request $request, int $id): JsonResponse
    {
        $this->visibleTo($request)->findOrFail($id)->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    public function readAll(Request $request): JsonResponse
    {
        $this->visibleTo($request)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi ditandai sudah dibaca.']);
    }

    private function visibleTo(Request $request)
    {
        $user = $request->user();

        return AppNotification::where('audience', $user->isSuperAdmin() ? 'admin' : 'user')
            ->when(! $user->isSuperAdmin(), fn ($q) => $q->where('user_id', $user->id));
    }
}
