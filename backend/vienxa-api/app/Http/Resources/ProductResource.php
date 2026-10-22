<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'unit' => $this->unit,
            'price' => $this->price,
            'stock' => $this->stock,
            'image' => $this->image
                ? (filter_var($this->image, FILTER_VALIDATE_URL) ? $this->image : Storage::disk('public')->url($this->image))
                : null,
            'video_url' => $this->video_url,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'rating' => (float) ($this->reviews_avg_rating ?? 0),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'sold_count' => (int) ($this->sold_count ?? 0),
            'created_at' => $this->created_at,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
        ];
    }
}
