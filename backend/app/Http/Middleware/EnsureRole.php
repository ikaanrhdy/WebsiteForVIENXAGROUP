<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pemakaian di route: ->middleware('role:super_admin')  atau  'role:user'
 * Menolak akun nonaktif dan peran yang tidak sesuai.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }
        if (! $user->is_active) {
            return response()->json(['message' => 'Akun Anda dinonaktifkan. Hubungi admin.'], 403);
        }
        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke halaman ini.'], 403);
        }

        return $next($request);
    }
}
