<?php

namespace App\Services;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

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

        // Enregistrer l'activité de connexion
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_USER_LOGIN,
            category:   ActivityLog::CATEGORY_AUTH,
            resource:   'users',
            resourceId: $user->id,
            metadata:   ['email' => $user->email],
            userId:     $user->id
        );

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
        // Enregistrer l'activité de déconnexion
        $this->activityLogService->log(
            eventType:  ActivityLog::EVENT_USER_LOGOUT,
            category:   ActivityLog::CATEGORY_AUTH,
            resource:   'users',
            resourceId: $user->id,
            userId:     $user->id
        );

        $user->currentAccessToken()->delete();
    }
}

