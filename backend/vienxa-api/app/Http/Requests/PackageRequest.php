<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // akses sudah dijaga middleware role:super_admin
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'audience' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:200'],
            'price' => ['nullable', 'integer', 'min:0'],
            'featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
