<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use HttpResponses;

    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Obtenir la liste paginée des produits (avec filtres, recherche, tri).
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'category', 'search', 'min_price', 'max_price',
            'color', 'material', 'is_featured', 'sort_by', 'sort_order'
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Créer un nouveau produit.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $imageFile = $request->file('image');
        $galleryFiles = $request->file('galleries', []);

        $product = $this->productService->createProduct($data, $imageFile, $galleryFiles);

        return $this->successResponse(
            new ProductResource($product->load(['category', 'galleries'])),
            'Produit créé avec succès.',
            201
        );
    }

    /**
     * Mettre à jour un produit existant.
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $this->productService->getProductById($id);
        $data = $request->validated();
        $imageFile = $request->file('image');
        $galleryFiles = $request->file('galleries', []);
        $deletedGalleryIds = $request->input('deleted_gallery_ids', []);

        $updated = $this->productService->updateProduct(
            $product, $data, $imageFile, $galleryFiles, $deletedGalleryIds
        );

        return $this->successResponse(
            new ProductResource($updated->load(['category', 'galleries'])),
            'Produit modifié avec succès.'
        );
    }

    /**
     * Supprimer un produit.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = $this->productService->getProductById($id);
        $this->productService->deleteProduct($product);

        return $this->successResponse(null, 'Produit supprimé avec succès.');
    }
}
