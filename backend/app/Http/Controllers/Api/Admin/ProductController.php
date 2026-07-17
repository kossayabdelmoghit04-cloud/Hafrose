<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminProductIndexRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\ProductService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected ProductService   $productService,
        protected AdminLogService  $adminLogService,
    ) {}

    /**
     * Obtenir la liste paginée des produits (avec filtres, recherche, tri).
     */
    public function index(AdminProductIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $filters = array_filter([
            'category'    => $validated['category']    ?? null,
            'search'      => $validated['search']      ?? null,
            'min_price'   => $validated['min_price']   ?? null,
            'max_price'   => $validated['max_price']   ?? null,
            'color'       => $validated['color']       ?? null,
            'material'    => $validated['material']    ?? null,
            'brand'       => $validated['brand']       ?? null,
            'is_featured' => $validated['is_featured'] ?? null,
            'sort_by'     => $validated['sort_by']     ?? null,
            'sort_order'  => $validated['sort_order']  ?? null,
        ], fn ($v) => $v !== null);

        $perPage  = (int) ($validated['per_page'] ?? 15);
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
        $data         = $request->validated();
        $imageFile    = $request->file('image');
        $galleryFiles = $request->file('galleries', []);

        $product = $this->productService->createProduct($data, $imageFile, $galleryFiles);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_CREATE,
            resource:   AdminLog::RESOURCE_PRODUCT,
            resourceId: $product->id,
            newValues:  $this->adminLogService->sanitize($data, ['image', 'galleries']),
        );

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
        $product           = $this->productService->getProductById($id);
        $oldValues         = $this->adminLogService->extractModelValues(
            $product,
            ['name', 'slug', 'price', 'stock', 'is_active', 'is_featured', 'category_id']
        );
        $data              = $request->validated();
        $imageFile         = $request->file('image');
        $galleryFiles      = $request->file('galleries', []);
        $deletedGalleryIds = $request->input('deleted_gallery_ids', []);

        $updated = $this->productService->updateProduct(
            $product, $data, $imageFile, $galleryFiles, $deletedGalleryIds
        );

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_UPDATE,
            resource:   AdminLog::RESOURCE_PRODUCT,
            resourceId: $product->id,
            oldValues:  $oldValues,
            newValues:  $this->adminLogService->sanitize($data, ['image', 'galleries']),
        );

        return $this->successResponse(
            new ProductResource($updated->load(['category', 'galleries'])),
            'Produit modifié avec succès.'
        );
    }

    /**
     * Supprimer un produit.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $product  = $this->productService->getProductById($id);
        $snapshot = $this->adminLogService->extractModelValues($product, ['id', 'name', 'slug']);

        $this->productService->deleteProduct($product);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_DELETE,
            resource:   AdminLog::RESOURCE_PRODUCT,
            resourceId: $id,
            oldValues:  $snapshot,
        );

        return $this->successResponse(null, 'Produit supprimé avec succès.');
    }
}
