<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
     * Règles de validation pour la mise à jour d'un produit.
     * Le slug exclut le produit en cours pour permettre de le conserver.
     */
    public function rules(): array
    {
        $product   = $this->route('product');
        $productId = is_object($product) ? $product->id : (int) $product;

        return [
            'category_id'       => 'required|integer|exists:categories,id',
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:products,slug,' . $productId,
            'description'       => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'price'             => 'required|numeric|min:0|max:9999999.99',
            'stock'             => 'required|integer|min:0|max:99999',
            'color'             => 'nullable|string|max:100',
            'material'          => 'nullable|string|max:100',
            'brand'             => 'nullable|string|max:100',
            'is_featured'       => 'nullable|boolean',
            'image'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'        => 'nullable|string|max:255',
            'galleries'         => 'nullable|array|max:10',
            'galleries.*'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'galleries_paths'   => 'nullable|array',
            'galleries_paths.*' => 'nullable|string|max:255',
            'deleted_gallery_ids'   => 'nullable|array',
            'deleted_gallery_ids.*' => 'nullable|integer|exists:galleries,id',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'category_id.required'         => 'La catégorie est obligatoire.',
            'category_id.integer'          => 'L\'identifiant de la catégorie doit être un entier.',
            'category_id.exists'           => 'La catégorie sélectionnée n\'existe pas.',
            'name.required'                => 'Le nom du produit est obligatoire.',
            'name.max'                     => 'Le nom du produit ne doit pas dépasser 255 caractères.',
            'slug.required'                => 'Le slug est obligatoire.',
            'slug.unique'                  => 'Ce slug est déjà utilisé par un autre produit.',
            'description.required'         => 'La description est obligatoire.',
            'short_description.max'        => 'La description courte ne doit pas dépasser 500 caractères.',
            'price.required'               => 'Le prix est obligatoire.',
            'price.numeric'                => 'Le prix doit être un nombre.',
            'price.min'                    => 'Le prix ne peut pas être négatif.',
            'price.max'                    => 'Le prix ne peut pas dépasser 9 999 999,99.',
            'stock.required'               => 'Le stock est obligatoire.',
            'stock.integer'                => 'Le stock doit être un entier.',
            'stock.min'                    => 'Le stock ne peut pas être négatif.',
            'stock.max'                    => 'Le stock ne peut pas dépasser 99 999 unités.',
            'image.image'                  => 'L\'image principale doit être un fichier image valide.',
            'image.mimes'                  => 'L\'image doit être au format JPEG, PNG, JPG ou WEBP.',
            'image.max'                    => 'L\'image principale ne doit pas dépasser 5 Mo.',
            'galleries.max'                => 'La galerie ne peut pas contenir plus de 10 images.',
            'galleries.*.image'            => 'Chaque fichier de galerie doit être une image valide.',
            'galleries.*.mimes'            => 'Les images de galerie doivent être au format JPEG, PNG, JPG ou WEBP.',
            'galleries.*.max'              => 'Chaque image de galerie ne doit pas dépasser 5 Mo.',
            'deleted_gallery_ids.*.exists' => 'L\'une des images à supprimer est introuvable.',
        ];
    }
}
