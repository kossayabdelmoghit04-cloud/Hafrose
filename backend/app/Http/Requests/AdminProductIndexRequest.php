<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductIndexRequest extends FormRequest
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
     * Règles de validation pour le listing paginé et filtré des produits (admin).
     */
    public function rules(): array
    {
        return [
            'category'   => 'nullable|string|max:255',
            'search'     => 'nullable|string|max:255',
            'min_price'  => 'nullable|numeric|min:0',
            'max_price'  => 'nullable|numeric|min:0',
            'color'      => 'nullable|string|max:100',
            'material'   => 'nullable|string|max:100',
            'brand'      => 'nullable|string|max:100',
            'is_featured' => 'nullable|in:true,false,1,0',
            'sort_by'    => 'nullable|string|in:name,price,created_at,stock',
            'sort_order' => 'nullable|string|in:asc,desc',
            'per_page'   => 'nullable|integer|min:1|max:100',
            'page'       => 'nullable|integer|min:1',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'search.max'          => 'Le terme de recherche ne doit pas dépasser 255 caractères.',
            'category.max'        => 'Le filtre catégorie ne doit pas dépasser 255 caractères.',
            'min_price.numeric'   => 'Le prix minimum doit être un nombre.',
            'min_price.min'       => 'Le prix minimum ne peut pas être négatif.',
            'max_price.numeric'   => 'Le prix maximum doit être un nombre.',
            'max_price.min'       => 'Le prix maximum ne peut pas être négatif.',
            'color.max'           => 'Le filtre couleur ne doit pas dépasser 100 caractères.',
            'material.max'        => 'Le filtre matière ne doit pas dépasser 100 caractères.',
            'brand.max'           => 'Le filtre marque ne doit pas dépasser 100 caractères.',
            'is_featured.in'      => 'Le filtre "mis en avant" doit être vrai ou faux.',
            'sort_by.in'          => 'Le champ de tri doit être : name, price, created_at ou stock.',
            'sort_order.in'       => 'La direction du tri doit être asc ou desc.',
            'per_page.integer'    => 'Le nombre d\'éléments par page doit être un entier.',
            'per_page.min'        => 'Le nombre d\'éléments par page doit être au moins 1.',
            'per_page.max'        => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
            'page.integer'        => 'Le numéro de page doit être un entier.',
            'page.min'            => 'Le numéro de page doit être au moins 1.',
        ];
    }
}
