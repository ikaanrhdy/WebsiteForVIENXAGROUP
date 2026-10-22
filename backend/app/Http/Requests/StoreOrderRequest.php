<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'package_id' => ['required', Rule::exists('packages', 'id')->where('is_active', true)],
            'project_name' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:3000'],
        ];
    }

    public function messages(): array
    {
        return [
            'package_id.required' => 'Pilih salah satu paket.',
            'package_id.exists' => 'Paket tidak tersedia.',
            'project_name.required' => 'Nama proyek wajib diisi.',
            'description.required' => 'Kebutuhan wajib diisi.',
        ];
    }
}
