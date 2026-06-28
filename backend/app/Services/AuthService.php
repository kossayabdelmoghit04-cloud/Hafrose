<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Authentifier un administrateur et générer un token Sanctum.
     *
     * @throws AuthenticationException
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new AuthenticationException('Identifiants incorrects.');
        }

        // Vérifier si l'utilisateur est administrateur
        if ($user->role !== User::ROLE_ADMIN && !$user->hasRole('admin')) {
            throw new AuthenticationException('Accès interdit. Réservé aux administrateurs.');
        }

        // Créer un token Sanctum
        $token = $user->createToken('admin-token')->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user,
        ];
    }

    /**
     * Déconnecter l'utilisateur en révoquant son token actuel.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
