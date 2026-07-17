<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
     * Règles de validation pour la création d'une catégorie.
     */
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:categories,slug',
            'description' => 'nullable|string|max:5000',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'  => 'nullable|string|max:255',
        ];
    }

    /**
     * Messages d'erreur personnalisés.
     */
    public function messages(): array
    {
        return [
            'name.required'    => 'Le nom de la catégorie est obligatoire.',
            'name.string'      => 'Le nom de la catégorie doit être une chaîne de caractères.',
            'name.max'         => 'Le nom de la catégorie ne doit pas dépasser 255 caractères.',
            'slug.required'    => 'Le slug est obligatoire.',
            'slug.string'      => 'Le slug doit être une chaîne de caractères.',
            'slug.max'         => 'Le slug ne doit pas dépasser 255 caractères.',
            'slug.unique'      => 'Ce slug est déjà utilisé par une autre catégorie.',
            'description.max'  => 'La description ne doit pas dépasser 5000 caractères.',
            'image.image'      => 'Le fichier doit être une image valide.',
            'image.mimes'      => 'L\'image doit être au format JPEG, PNG, JPG ou WEBP.',
            'image.max'        => 'L\'image ne doit pas dépasser 5 Mo.',
        ];
    }
}
