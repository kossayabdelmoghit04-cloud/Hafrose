<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AdvancedSearchRequest extends FormRequest
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
     * Règles de validation pour la recherche avancée.
     */
    public function rules(): array
    {
        return [
            'q' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0|gte:price_min',
            'brand' => 'nullable|string|max:255',
            'sort' => 'nullable|string|in:price_asc,price_desc,newest,oldest,rating,popular',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'q.max' => 'La recherche ne peut pas dépasser 255 caractères.',
            'category.max' => 'La catégorie est incorrecte.',
            'price_min.numeric' => 'Le prix minimum doit être un nombre.',
            'price_min.min' => 'Le prix minimum ne peut pas être négatif.',
            'price_max.numeric' => 'Le prix maximum doit être un nombre.',
            'price_max.min' => 'Le prix maximum ne peut pas être négatif.',
            'price_max.gte' => 'Le prix maximum doit être supérieur ou égal au prix minimum.',
            'brand.max' => 'La marque ne doit pas dépasser 255 caractères.',
            'sort.in' => 'Le tri spécifié est invalide. Les choix acceptés sont : price_asc, price_desc, newest, oldest, rating, popular.',
            'per_page.integer' => 'La pagination doit être un entier.',
            'per_page.min' => 'La pagination minimale est 1.',
            'per_page.max' => 'La pagination maximale est 100.',
            'page.integer' => 'Le numéro de page doit être un entier.',
            'page.min' => 'Le numéro de page doit être supérieur ou égal à 1.',
        ];
    }
}
