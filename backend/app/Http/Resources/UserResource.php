<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar_path ? Storage::disk('public')->url($this->avatar_path) : null,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'orders_count' => $this->whenCounted('orders'),
            'created_at' => $this->created_at,
        ];
    }
}
