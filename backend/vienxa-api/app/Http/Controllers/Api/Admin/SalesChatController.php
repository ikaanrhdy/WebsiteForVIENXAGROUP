<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\SalesChatMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SalesChatController extends Controller
{
    public function conversations(): JsonResponse
    {
        $customers = User::where('role', User::ROLE_USER)
            ->whereHas('salesChatMessages')
            ->withCount(['salesChatMessages as unread_count' => fn ($query) => $query
                ->whereColumn('sender_id', 'customer_id')
                ->whereNull('read_at')])
            ->with(['salesChatMessages' => fn ($query) => $query->latest()->limit(1)])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'avatar' => $customer->avatar_path ? Storage::disk('public')->url($customer->avatar_path) : null,
                'unread_count' => $customer->unread_count,
                'last_message' => $customer->salesChatMessages->first()?->message,
                'updated_at' => $customer->salesChatMessages->first()?->created_at,
            ]);

        return response()->json(['data' => $customers]);
    }

    public function index(int $userId): JsonResponse
    {
        $customer = User::where('role', User::ROLE_USER)->findOrFail($userId);
        SalesChatMessage::where('customer_id', $customer->id)
            ->where('sender_id', $customer->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['data' => $this->messages($customer->id)]);
    }

    public function store(Request $request, int $userId): JsonResponse
    {
        $customer = User::where('role', User::ROLE_USER)->findOrFail($userId);
        $data = $request->validate(['message' => ['required', 'string', 'max:3000']]);
        $message = SalesChatMessage::create([
            'customer_id' => $customer->id,
            'sender_id' => $request->user()->id,
            'message' => $data['message'],
        ]);
        $customer->touch();
        AppNotification::create([
            'audience' => 'user',
            'user_id' => $customer->id,
            'title' => 'Balasan admin',
            'message' => $data['message'],
            'link' => '/dashboard/chat',
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
