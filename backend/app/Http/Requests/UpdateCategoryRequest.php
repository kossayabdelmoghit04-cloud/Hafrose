<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Récupérer l'ID ou le slug de la catégorie en cours de modification
        // Si c'est un modèle lié dans la route, $this->route('category') renvoie l'instance ou l'identifiant.
        $category = $this->route('category');
        $categoryId = is_object($category) ? $category->id : $category;

        return [
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:categories,slug,' . $categoryId,
            'description' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'  => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la catégorie est obligatoire.',
            'slug.required' => 'Le slug est obligatoire.',
            'slug.unique'   => 'Ce slug est déjà utilisé par une autre catégorie.',
            'image.image'   => 'Le fichier doit être une image valide.',
            'image.max'     => 'L\'image ne doit pas dépasser 5 Mo.',
        ];
    }

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
