<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PackageRequest;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PackageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PackageResource::collection(Package::orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(PackageRequest $request): JsonResponse
    {
        $package = Package::create($request->validated());

        return (new PackageResource($package))->response()->setStatusCode(201);
    }

    public function update(PackageRequest $request, Package $package): PackageResource
    {
        $package->update($request->validated());

        return new PackageResource($package);
    }

    public function destroy(Package $package): JsonResponse
    {
        $package->delete(); // pesanan lama tetap ada (package_id menjadi null)

        return response()->json(null, 204);
    }
}
