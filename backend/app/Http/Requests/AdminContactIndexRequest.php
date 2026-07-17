<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AdminContactIndexRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (réservée aux administrateurs via middleware).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour le listing paginé et filtré des messages de contact (admin).
     */
    public function rules(): array
    {
        return [
            'search'   => 'nullable|string|max:255',
            'is_read'  => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page'     => 'nullable|integer|min:1',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'search.max'       => 'Le terme de recherche ne doit pas dépasser 255 caractères.',
            'is_read.boolean'  => 'Le filtre de lecture doit être vrai ou faux.',
            'per_page.integer' => 'Le nombre d\'éléments par page doit être un entier.',
            'per_page.min'     => 'Le nombre d\'éléments par page doit être au moins 1.',
            'per_page.max'     => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
            'page.integer'     => 'Le numéro de page doit être un entier.',
            'page.min'         => 'Le numéro de page doit être au moins 1.',
        ];
    }
}
