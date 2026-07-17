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
     *
     * — Retourne 401 si l'utilisateur n'est pas authentifié (token absent ou invalide).
     * — Retourne 403 si l'utilisateur est authentifié mais ne possède pas le rôle admin
     *   (vérifié via la colonne `role` de la DB ET via Spatie Permission pour robustesse).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Cas 1 : utilisateur non authentifié (token absent, invalide ou expiré)
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié. Veuillez vous connecter.',
                'errors'  => null,
                'data'    => null,
            ], 401);
        }

        // Cas 2 : utilisateur authentifié mais sans le rôle admin
        // On accepte le rôle via la colonne DB (role = 'admin') OU via Spatie Permission
        $isAdmin = ($user->role === User::ROLE_ADMIN) || $user->hasRole('admin');

        if (!$isAdmin) {
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
