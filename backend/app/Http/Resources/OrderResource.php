<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'project_name' => $this->project_name,
            'description' => $this->description,
            'status' => $this->status,
            'amount' => $this->amount,
            'admin_notes' => $this->admin_notes,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => $item->unit_price === null ? null : $item->unit_price * $item->quantity,
            ])),
            'created_at' => $this->created_at,
            'package' => $this->whenLoaded('package', fn () => $this->package
                ? ['id' => $this->package->id, 'name' => $this->package->name] : null),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email,
            ]),
        ];
    }
}
