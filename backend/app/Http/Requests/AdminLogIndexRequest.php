<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminLogIndexRequest extends FormRequest
{
    /**
     * Déterminer si l'utilisateur est autorisé à faire cette requête.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Obtenir les règles de validation pour les filtres des logs d'administration.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'per_page'      => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'          => ['nullable', 'integer', 'min:1'],
            'admin_id'      => ['nullable', 'integer', 'exists:users,id'],
            'action'        => ['nullable', 'string', 'max:50'],
            'resource'      => ['nullable', 'string', 'max:100'],
            'resource_type' => ['nullable', 'string', 'max:100'],
            'search'        => ['nullable', 'string', 'max:255'],
            'date_from'     => ['nullable', 'date_format:Y-m-d'],
            'date_to'       => ['nullable', 'date_format:Y-m-d'],
            'sort_by'       => ['nullable', 'string', 'in:id,action,resource,created_at,admin_id'],
            'sort_order'    => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
