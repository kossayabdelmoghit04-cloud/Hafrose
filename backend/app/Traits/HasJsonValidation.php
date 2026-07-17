<?php

namespace App\Traits;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Fournit une réponse JSON uniforme lors de l'échec de validation d'un Form Request.
 *
 * Utilisé dans tous les Form Requests de l'application pour garantir
 * un format de réponse cohérent : { success, message, errors, data }.
 */
trait HasJsonValidation
{
    /**
     * Gérer l'échec de la validation en retournant une réponse JSON 422 uniforme.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors'  => $validator->errors(),
            'data'    => null,
        ], 422));
    }
}
