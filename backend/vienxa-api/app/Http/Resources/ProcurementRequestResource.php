<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'organization_name' => $this->organization_name,
            'representative_name' => $this->representative_name,
            'organization_address' => $this->organization_address,
            'contact_phone' => $this->contact_phone,
            'organization_tax_id' => $this->organization_tax_id,
            'item_name' => $this->item_name,
            'item_unit' => $this->item_unit,
            'quantity' => $this->quantity,
            'estimated_budget' => $this->estimated_budget,
            'description' => $this->description,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
        ];
    }
}
