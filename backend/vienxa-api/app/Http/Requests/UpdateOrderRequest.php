<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // akses sudah dijaga middleware role:super_admin
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(Order::STATUSES)],
            'amount' => ['nullable', 'integer', 'min:0'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
