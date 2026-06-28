<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
     * Obtenir la liste filtrée et paginée des produits.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'category', 
            'min_price', 
            'max_price', 
            'color', 
            'material', 
            'search', 
            'is_featured', 
            'sort_by', 
            'sort_order'
        ]);

        $perPage = $request->integer('per_page', 12);

        $products = $this->productService->getPaginatedProducts($filters, $perPage);
        
        // Retourne la pagination complète enveloppée sous la clé 'data' pour la cohérence
        $paginatedData = ProductResource::collection($products)->response()->getData(true);

        return $this->successResponse($paginatedData);
    }

    /**
     * Obtenir le détail d'un produit par son slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->getProductBySlug($slug);
        return $this->successResponse(new ProductResource($product));
    }
}
