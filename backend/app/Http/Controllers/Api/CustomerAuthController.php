<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HttpResponses;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

/**
 * CustomerAuthController — Gère l'authentification des clients (inscription, connexion, déconnexion,
 * récupération de mot de passe) via l'API REST Sanctum.
 */
class CustomerAuthController extends Controller
{
    use HttpResponses;

    /**
     * Formatage canonique du payload utilisateur pour les réponses API.
     */
    protected function formatUserPayload(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'name'       => $user->full_name ?: $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'role'       => $user->role ?? 'customer',
            'created_at' => $user->created_at?->toISOString(),
        ];
    }

    /**
     * POST /api/auth/login
     * Connecte un client et génère un token Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.'],
            ]);
        }

        // Interdire la connexion client aux comptes administrateurs
        if ($user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est réservé à l\'espace administrateur.'],
            ]);
        }

        // Révoquer les anciens tokens pour éviter l'accumulation
        $user->tokens()->where('name', 'customer-token')->delete();

        $token = $user->createToken('customer-token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user'  => $this->formatUserPayload($user),
        ], 'Connexion réussie. Bienvenue dans la Maison HAFROSE.');
    }

    /**
     * POST /api/auth/register
     * Crée un compte client et génère un token Sanctum.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name'            => 'required|string|max:100',
            'last_name'             => 'required|string|max:100',
            'email'                 => 'required|email|max:255|unique:users,email',
            'phone'                 => 'nullable|string|max:30',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'name'       => trim($data['first_name'] . ' ' . $data['last_name']),
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($data['password']),
            'role'       => 'customer',
        ]);

        $token = $user->createToken('customer-token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user'  => $this->formatUserPayload($user),
        ], 'Compte créé avec succès. Bienvenue dans la Maison HAFROSE.', 201);
    }

    /**
     * POST /api/auth/logout
     * Révoque le token du client connecté.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Déconnexion réussie.');
    }

    /**
     * POST /api/auth/forgot-password
     * Envoie un email de réinitialisation de mot de passe.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->errorResponse(
                'Impossible d\'envoyer l\'email de réinitialisation. Vérifiez votre adresse email.',
                422
            );
        }

        return $this->successResponse(null, 'Un lien de réinitialisation vous a été envoyé par email.');
    }

    /**
     * POST /api/auth/reset-password
     * Réinitialise le mot de passe via le token de réinitialisation.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email|max:255',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->errorResponse('Le lien de réinitialisation est invalide ou expiré.', 422);
        }

        return $this->successResponse(null, 'Mot de passe réinitialisé avec succès. Veuillez vous connecter.');
    }

    /**
     * GET /api/auth/me
     * Retourne le profil complet du client connecté.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->successResponse($this->formatUserPayload($user));
    }

    /**
     * PUT /api/auth/profile
     * Met à jour le profil du client connecté.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name'  => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone'      => 'nullable|string|max:30',
        ]);

        $user->fill($data);
        if (isset($data['first_name']) || isset($data['last_name'])) {
            $user->name = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        }
        $user->save();

        return $this->successResponse($this->formatUserPayload($user), 'Profil mis à jour avec succès.');
    }

    /**
     * PUT /api/auth/password
     * Met à jour le mot de passe du client connecté.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        // Révoquer tous les autres tokens pour forcer une reconnexion sécurisée
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return $this->successResponse(null, 'Mot de passe mis à jour avec succès.');
    }
}
