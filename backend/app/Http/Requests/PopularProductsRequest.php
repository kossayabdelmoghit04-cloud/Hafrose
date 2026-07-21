<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class PopularProductsRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la limite des produits populaires.
     */
    public function rules(): array
    {
        return [
            'limit' => 'nullable|integer|min:1|max:50',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'limit.integer' => 'La limite doit être un nombre entier.',
            'limit.min'     => 'La limite doit être au moins de 1.',
            'limit.max'     => 'La limite ne peut pas dépasser 50.',
        ];
    }
}
