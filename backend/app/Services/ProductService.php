<?php

namespace App\Services;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService
{
    protected ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Obtenir les produits filtrés et paginés.
     */
    public function getPaginatedProducts(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        return $this->productRepository->paginateWithFilters($filters, $perPage);
    }

    /**
     * Obtenir un produit par son slug.
     */
    public function getProductBySlug(string $slug)
    {
        $product = $this->productRepository->findBySlug($slug);

        if (!$product) {
            throw new ModelNotFoundException("Product not found");
        }

        return $product;
    }

    /**
     * Trouver un produit par son ID.
     */
    public function getProductById(int $id)
    {
        $product = $this->productRepository->find($id);

        if (!$product) {
            throw new ModelNotFoundException("Product not found");
        }

        return $product;
    }

    /**
     * Créer un produit avec ses images (principale et galerie).
     */
    public function createProduct(array $data, ?\Illuminate\Http\UploadedFile $imageFile = null, array $galleryFiles = []): Product
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data, $imageFile, $galleryFiles) {
            // Gérer l'image principale
            if ($imageFile) {
                $path = $imageFile->store('products', 'public');
                $data['image'] = \Illuminate\Support\Facades\Storage::url($path);
            } elseif (!empty($data['image_path'])) {
                $data['image'] = \Illuminate\Support\Facades\Storage::url($data['image_path']);
            }

            // Assurer la valeur par défaut pour is_featured
            $data['is_featured'] = isset($data['is_featured']) ? (bool)$data['is_featured'] : false;

            // Créer le produit
            $product = $this->productRepository->create($data);

            // Gérer la galerie d'images
            $this->saveGalleries($product, $galleryFiles, $data['galleries_paths'] ?? []);

            return $product->load('galleries');
        });
    }

    /**
     * Mettre à jour un produit et ses images.
     */
    public function updateProduct(Product $product, array $data, ?\Illuminate\Http\UploadedFile $imageFile = null, array $galleryFiles = [], array $deletedGalleryIds = []): Product
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($product, $data, $imageFile, $galleryFiles, $deletedGalleryIds) {
            // Gérer l'image principale
            if ($imageFile) {
                // Supprimer l'ancienne image si elle existe
                if ($product->image) {
                    $this->deletePhysicalImage($product->image);
                }
                $path = $imageFile->store('products', 'public');
                $data['image'] = \Illuminate\Support\Facades\Storage::url($path);
            } elseif (!empty($data['image_path'])) {
                $data['image'] = \Illuminate\Support\Facades\Storage::url($data['image_path']);
            }

            // Mettre à jour is_featured
            $data['is_featured'] = isset($data['is_featured']) ? (bool)$data['is_featured'] : false;

            // Mettre à jour les informations du produit
            $product = $this->productRepository->update($product, $data);

            // Supprimer les images de la galerie sélectionnées
            if (!empty($deletedGalleryIds)) {
                $this->deleteGalleryImages($product, $deletedGalleryIds);
            }

            // Ajouter de nouvelles images à la galerie
            $this->saveGalleries($product, $galleryFiles, $data['galleries_paths'] ?? []);

            return $product->load('galleries');
        });
    }

    /**
     * Supprimer un produit et tous ses fichiers associés.
     */
    public function deleteProduct(Product $product): bool
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($product) {
            // Supprimer l'image principale
            if ($product->image) {
                $this->deletePhysicalImage($product->image);
            }

            // Supprimer toutes les images de la galerie
            foreach ($product->galleries as $gallery) {
                $this->deletePhysicalImage($gallery->image);
                $gallery->delete();
            }

            // Supprimer le produit
            return $this->productRepository->delete($product);
        });
    }

    /**
     * Sauvegarder les images de la galerie (fichiers uploadés ou chemins médias).
     */
    private function saveGalleries(Product $product, array $galleryFiles, array $galleryPaths): void
    {
        // Enregistrer les fichiers uploadés
        foreach ($galleryFiles as $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $path = $file->store('products/gallery', 'public');
                $product->galleries()->create([
                    'image' => \Illuminate\Support\Facades\Storage::url($path)
                ]);
            }
        }

        // Enregistrer les chemins d'accès réutilisés
        foreach ($galleryPaths as $path) {
            if (!empty($path)) {
                $product->galleries()->create([
                    'image' => \Illuminate\Support\Facades\Storage::url($path)
                ]);
            }
        }
    }

    /**
     * Supprimer des images spécifiques de la galerie.
     */
    private function deleteGalleryImages(Product $product, array $galleryIds): void
    {
        $galleries = $product->galleries()->whereIn('id', $galleryIds)->get();

        foreach ($galleries as $gallery) {
            $this->deletePhysicalImage($gallery->image);
            $gallery->delete();
        }
    }

    /**
     * Supprimer physiquement un fichier sur le disque public à partir de son URL.
     */
    private function deletePhysicalImage(string $url): void
    {
        // L'url ressemble à /storage/products/filename.jpg ou http://localhost/storage/products/filename.jpg
        // Nous voulons extraire products/filename.jpg
        $path = parse_url($url, PHP_URL_PATH);
        $relativePath = str_replace('/storage/', '', $path);
        
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
        }
    }
}
