<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileApiController extends Controller
{
    use HttpResponses;

    /**
     * Enregistrement d'un token de notification push mobile.
     */
    public function registerDeviceToken(Request $request): JsonResponse
    {
        $token = $request->input('token', '');
        $platform = $request->input('platform', 'web');
        $userId = $request->user('sanctum')?->id;

        if (empty($token)) {
            return $this->errorResponse('Token manquant.', 422);
        }

        DeviceToken::updateOrCreate(
            ['token' => $token],
            ['user_id' => $userId, 'platform' => $platform]
        );

        return $this->successResponse(['registered' => true], 'Token enregistré avec succès.');
    }

    /**
     * Informations de configuration de l'application mobile HAFROSE.
     */
    public function appConfig(): JsonResponse
    {
        return $this->successResponse([
            'version' => '2.0.0',
            'api_base' => '/api',
            'features' => [
                'loyalty' => true,
                'gift_cards' => true,
                'ai_assistant' => true,
                'push_notifications' => true,
                'multi_currency' => true,
                'multi_language' => ['fr', 'ar', 'en'],
            ],
        ]);
    }
}
