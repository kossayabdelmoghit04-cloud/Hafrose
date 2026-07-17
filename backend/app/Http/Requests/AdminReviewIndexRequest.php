<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AdminReviewIndexRequest extends FormRequest
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
     * Règles de validation pour le listing paginé des avis (admin).
     */
    public function rules(): array
    {
        return [
            'per_page'    => 'nullable|integer|min:1|max:100',
            'page'        => 'nullable|integer|min:1',
            'is_approved' => 'nullable|boolean',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'per_page.integer'     => 'Le nombre d\'éléments par page doit être un entier.',
            'per_page.min'         => 'Le nombre d\'éléments par page doit être au moins 1.',
            'per_page.max'         => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
            'page.integer'         => 'Le numéro de page doit être un entier.',
            'page.min'             => 'Le numéro de page doit être au moins 1.',
            'is_approved.boolean'  => 'Le filtre d\'approbation doit être vrai ou faux.',
        ];
    }
}
