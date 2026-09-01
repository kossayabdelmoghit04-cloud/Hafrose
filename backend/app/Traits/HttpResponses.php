<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait HttpResponses
{
    /**
     * Retourner une réponse de succès au format standardisé.
     */
    protected function successResponse(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'errors' => null,
            'data' => $data,
        ], $code);
    }

    /**
     * Retourner une réponse paginée au format standardisé.
     * data = tableau plat de ressources
     * meta = informations de pagination (current_page, last_page, per_page, total...)
     * links = liens de navigation (first, last, prev, next)
     */
    protected function paginatedResponse(mixed $resourceCollection, ?string $message = null, int $code = 200): JsonResponse
    {
        $response = $resourceCollection->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => $message,
            'errors' => null,
            'data' => $response['data'] ?? [],
            'meta' => $response['meta'] ?? null,
            'links' => $response['links'] ?? null,
        ], $code);
    }

    /**
     * Retourner une réponse d'erreur au format standardisé.
     */
    protected function errorResponse(string $message, int $code, mixed $errors = null, mixed $data = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'data' => $data,
        ], $code);
    }
}
