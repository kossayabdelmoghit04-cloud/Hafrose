<?php

namespace App\Http\Requests;

use App\Models\ActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valide les paramètres de filtrage et pagination pour le journal d'activité global.
 */
class ActivityLogIndexRequest extends FormRequest
{
    /**
     * Seuls les administrateurs authentifiés peuvent consulter le journal.
     */
    public function authorize(): bool
    {
        return true; // Protégé par le middleware 'admin' au niveau des routes.
    }

    /**
     * Règles de validation des paramètres de filtrage.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $allowedCategories = [
            ActivityLog::CATEGORY_AUTH,
            ActivityLog::CATEGORY_ORDER,
            ActivityLog::CATEGORY_WISHLIST,
            ActivityLog::CATEGORY_CONTACT,
            ActivityLog::CATEGORY_REVIEW,
            ActivityLog::CATEGORY_SECURITY,
            ActivityLog::CATEGORY_ADMIN,
        ];

        $allowedSortBy = ['created_at', 'category', 'event_type', 'resource'];

        return [
            // Filtres
            'category'   => ['sometimes', 'string', Rule::in($allowedCategories)],
            'event_type' => ['sometimes', 'string', 'max:100'],
            'user_id'    => ['sometimes', 'integer', 'min:1'],
            'resource'   => ['sometimes', 'string', 'max:100'],
            'date_from'  => ['sometimes', 'date_format:Y-m-d'],
            'date_to'    => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'search'     => ['sometimes', 'string', 'max:150'],

            // Tri et pagination
            'sort_by'    => ['sometimes', 'string', Rule::in($allowedSortBy)],
            'sort_order' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page'   => ['sometimes', 'integer', 'min:5', 'max:100'],
        ];
    }

    /**
     * Messages de validation personnalisés.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.in'          => 'La catégorie fournie est invalide.',
            'date_to.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'sort_by.in'           => 'Le champ de tri est invalide.',
            'sort_order.in'        => "L'ordre de tri doit être 'asc' ou 'desc'.",
            'per_page.min'         => 'Le nombre de résultats par page minimum est 5.',
            'per_page.max'         => 'Le nombre de résultats par page maximum est 100.',
        ];
    }
}
