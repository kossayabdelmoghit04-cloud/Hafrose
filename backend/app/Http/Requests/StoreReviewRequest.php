<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreReviewRequest extends FormRequest
{
    /**
     * Autoriser cette requête (API publique).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la création d'un avis.
     */
    public function rules(): array
    {
        return [
            'product_id'    => 'required|integer|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'rating'        => 'required|integer|min:1|max:5',
            'comment'       => 'required|string|min:10|max:2000',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'product_id.required'    => 'Le produit est obligatoire.',
            'product_id.exists'      => 'Le produit sélectionné n\'existe pas.',
            'customer_name.required' => 'Le nom du client est obligatoire.',
            'rating.required'        => 'La note est obligatoire.',
            'rating.min'             => 'La note doit être au minimum de 1.',
            'rating.max'             => 'La note doit être au maximum de 5.',
            'comment.required'       => 'Le commentaire est obligatoire.',
            'comment.min'            => 'Le commentaire doit contenir au moins 10 caractères.',
        ];
    }

    /**
     * Gérer l'échec de la validation en retournant un JSON uniforme.
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
