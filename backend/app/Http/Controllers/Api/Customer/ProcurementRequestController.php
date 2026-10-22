<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProcurementRequestResource;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProcurementRequestController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProcurementRequestResource::collection(
            $request->user()->procurementRequests()->latest()->get()
        );
    }

    public function store(Request $request): ProcurementRequestResource|JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'organization_name' => ['nullable', 'string', 'max:180'],
            'representative_name' => ['nullable', 'string', 'max:150'],
            'organization_address' => ['nullable', 'string', 'max:1000'],
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'organization_tax_id' => ['nullable', 'string', 'max:40'],
            'item_name' => ['required', 'string', 'max:180'],
            'item_unit' => ['nullable', 'string', 'max:40'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'estimated_budget' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:3000'],
        ], [
            'title.required' => 'Nama pengajuan wajib diisi.',
            'item_name.required' => 'Nama barang atau jasa wajib diisi.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'description.required' => 'Alasan dan detail pengajuan wajib diisi.',
        ]);

        $procurementRequest = $request->user()->procurementRequests()->create($data);

        AppNotification::create([
            'audience' => 'admin',
            'title' => 'Pengajuan pengadaan baru',
            'message' => "{$request->user()->name} mengirim pengajuan {$procurementRequest->code}.",
            'link' => '/admin/pengadaan',
        ]);
        AppNotification::create([
            'audience' => 'user',
            'user_id' => $request->user()->id,
            'title' => 'Pengajuan berhasil dikirim',
            'message' => "Pengajuan {$procurementRequest->code} menunggu konfirmasi super admin.",
            'link' => '/dashboard/pengadaan',
        ]);

        return (new ProcurementRequestResource($procurementRequest))->response()->setStatusCode(201);
    }
}
