<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(
            User::withCount('orders')->orderByRaw("role = 'super_admin' desc")->latest()->get()
        );
    }

    public function update(Request $request, User $user): UserResource|JsonResponse
    {
        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Akun super admin tidak dapat diubah dari sini.'], 422);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($data);

        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            $user->tokens()->delete(); // paksa keluar dari semua perangkat
        }

        return new UserResource($user->loadCount('orders'));
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Akun super admin tidak dapat dihapus.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(null, 204);
    }
}
