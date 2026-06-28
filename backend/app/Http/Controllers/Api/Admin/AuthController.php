<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use HttpResponses;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Authentifier un administrateur et générer le token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $result = $this->authService->login($credentials);

            return $this->successResponse([
                'token' => $result['token'],
                'user'  => [
                    'id'    => $result['user']->id,
                    'name'  => $result['user']->name,
                    'email' => $result['user']->email,
                    'role'  => $result['user']->role,
                ]
            ], 'Connexion réussie.');
        } catch (\Illuminate\Auth\AuthenticationException $e) {
            return $this->errorResponse($e->getMessage(), 401);
        }
    }

    /**
     * Déconnecter l'administrateur en révoquant le token de session.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());
        return $this->successResponse(null, 'Déconnexion réussie.');
    }

    /**
     * Obtenir les détails de l'administrateur connecté.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->successResponse([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ]);
    }
}
