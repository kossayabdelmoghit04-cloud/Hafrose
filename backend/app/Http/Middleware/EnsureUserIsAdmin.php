<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Vérifier que l'utilisateur authentifié est bien un administrateur.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Réservé aux administrateurs.',
                'errors'  => null,
                'data'    => null,
            ], 403);
        }

        return $next($request);
    }
}
