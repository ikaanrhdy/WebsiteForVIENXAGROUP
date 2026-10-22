<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\SalesChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        SalesChatMessage::where('customer_id', $user->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['data' => $this->messages($user->id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:3000']]);
        $user = $request->user();
        $message = SalesChatMessage::create([
            'customer_id' => $user->id,
            'sender_id' => $user->id,
            'message' => $data['message'],
        ]);
        $user->touch();
        AppNotification::create([
            'audience' => 'admin',
            'title' => 'Pesan penjualan baru',
            'message' => "{$user->name}: {$data['message']}",
            'link' => '/admin/chat',
        ]);

        return response()->json(['data' => $message->load('sender')], 201);
    }

    private function messages(int $customerId)
    {
        return SalesChatMessage::with('sender')
            ->where('customer_id', $customerId)
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values();
    }
}
