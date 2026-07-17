<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class ProductSearchRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (API publique).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la recherche et le filtrage des produits.
     */
    public function rules(): array
    {
        return [
            // Paramètres de recherche textuelle
            'q'           => 'nullable|string|max:255',
            'search'      => 'nullable|string|max:255',

            // Catégorie (accepte un ID ou un slug)
            'category'    => 'nullable|string|max:255',

            // Plage de prix
            'price_min'   => 'nullable|numeric|min:0',
            'min_price'   => 'nullable|numeric|min:0',
            'price_max'   => 'nullable|numeric|min:0',
            'max_price'   => 'nullable|numeric|min:0',

            // Tri
            'sort'        => 'nullable|string|in:name,price,created_at',
            'sort_by'     => 'nullable|string|in:name,price,created_at',
            'direction'   => 'nullable|string|in:asc,desc,ASC,DESC',
            'sort_order'  => 'nullable|string|in:asc,desc,ASC,DESC',

            // Pagination
            'per_page'    => 'nullable|integer|min:1|max:100',
            'page'        => 'nullable|integer|min:1',

            // Filtres additionnels
            'color'       => 'nullable|string|max:100',
            'material'    => 'nullable|string|max:100',
            'is_featured' => 'nullable|in:true,false,1,0',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'q.max'            => 'La recherche textuelle ne doit pas dépasser 255 caractères.',
            'search.max'       => 'La recherche textuelle ne doit pas dépasser 255 caractères.',

            'price_min.numeric' => 'Le prix minimum doit être un nombre.',
            'price_min.min'     => 'Le prix minimum ne peut pas être négatif.',
            'min_price.numeric' => 'Le prix minimum doit être un nombre.',
            'min_price.min'     => 'Le prix minimum ne peut pas être négatif.',
            'price_max.numeric' => 'Le prix maximum doit être un nombre.',
            'price_max.min'     => 'Le prix maximum ne peut pas être négatif.',
            'max_price.numeric' => 'Le prix maximum doit être un nombre.',
            'max_price.min'     => 'Le prix maximum ne peut pas être négatif.',

            'sort.in'           => 'Le champ de tri doit être : name, price ou created_at.',
            'sort_by.in'        => 'Le champ de tri doit être : name, price ou created_at.',
            'direction.in'      => 'La direction du tri doit être asc ou desc.',
            'sort_order.in'     => 'La direction du tri doit être asc ou desc.',

            'per_page.integer'  => 'Le nombre d\'éléments par page doit être un entier.',
            'per_page.min'      => 'Le nombre d\'éléments par page doit être au moins 1.',
            'per_page.max'      => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
            'page.integer'      => 'Le numéro de page doit être un entier.',
            'page.min'          => 'Le numéro de page doit être au moins 1.',

            'is_featured.in' => 'Le filtre "mis en avant" doit être vrai ou faux.',
        ];
    }
}
