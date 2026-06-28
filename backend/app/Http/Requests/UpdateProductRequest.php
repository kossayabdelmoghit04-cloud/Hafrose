<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('product');
        $productId = is_object($product) ? $product->id : $product;

        return [
            'category_id'       => 'required|exists:categories,id',
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:products,slug,' . $productId,
            'description'       => 'required|string',
            'short_description' => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'stock'             => 'required|integer|min:0',
            'color'             => 'nullable|string|max:100',
            'material'          => 'nullable|string|max:100',
            'brand'             => 'nullable|string|max:100',
            'is_featured'       => 'nullable|boolean',
            'image'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'        => 'nullable|string|max:255',
            'galleries'         => 'nullable|array',
            'galleries.*'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'galleries_paths'   => 'nullable|array',
            'galleries_paths.*' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists'   => 'La catégorie sélectionnée n\'existe pas.',
            'name.required'        => 'Le nom du produit est obligatoire.',
            'slug.required'        => 'Le slug est obligatoire.',
            'slug.unique'          => 'Ce slug est déjà utilisé par un autre produit.',
            'description.required' => 'La description est obligatoire.',
            'price.required'       => 'Le prix est obligatoire.',
            'price.numeric'        => 'Le prix doit être un nombre.',
            'price.min'            => 'Le prix ne peut pas être négatif.',
            'stock.required'       => 'Le stock est obligatoire.',
            'stock.integer'        => 'Le stock doit être un entier.',
            'stock.min'            => 'Le stock ne peut pas être négatif.',
            'image.image'          => 'L\'image principale doit être valide.',
            'image.max'            => 'L\'image principale ne doit pas dépasser 5 Mo.',
            'galleries.*.image'    => 'Chaque fichier de galerie doit être une image.',
            'galleries.*.max'      => 'Chaque image de galerie ne doit pas dépasser 5 Mo.',
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
