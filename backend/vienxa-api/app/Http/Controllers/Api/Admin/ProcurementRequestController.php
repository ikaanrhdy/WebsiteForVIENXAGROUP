<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProcurementRequestResource;
use App\Models\AppNotification;
use App\Models\ProcurementRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProcurementRequestController extends Controller
{
    public function show(ProcurementRequest $procurementRequest): ProcurementRequestResource
    {
        return new ProcurementRequestResource($procurementRequest->load('user'));
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return ProcurementRequestResource::collection(
            ProcurementRequest::with('user')
                ->when(
                    in_array($request->query('status'), ProcurementRequest::STATUSES, true),
                    fn ($query) => $query->where('status', $request->query('status'))
                )
                ->latest()
                ->get()
        );
    }

    public function update(Request $request, ProcurementRequest $procurementRequest): ProcurementRequestResource|JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([ProcurementRequest::APPROVED, ProcurementRequest::REJECTED])],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $procurementRequest = DB::transaction(function () use ($procurementRequest, $data) {
            $lockedRequest = ProcurementRequest::whereKey($procurementRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedRequest->status !== ProcurementRequest::PENDING) {
                return null;
            }

            $lockedRequest->update($data);

            return $lockedRequest->load('user');
        });

        if (! $procurementRequest) {
            return response()->json([
                'message' => 'Pengajuan ini sudah dikonfirmasi sebelumnya.',
            ], 422);
        }

        AppNotification::create([
            'audience' => 'user',
            'user_id' => $procurementRequest->user_id,
            'title' => 'Status pengajuan diperbarui',
            'message' => "Pengajuan {$procurementRequest->code} telah {$procurementRequest->status} oleh super admin.",
            'link' => '/dashboard/pengadaan',
        ]);

        return new ProcurementRequestResource($procurementRequest);
    }
}
