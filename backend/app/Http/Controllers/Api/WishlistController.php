<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWishlistRequest;
use App\Http\Resources\WishlistResource;
use App\Models\Product;
use App\Services\WishlistService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use HttpResponses;

    protected WishlistService $wishlistService;

    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    /**
     * Récupérer tous les favoris de l'utilisateur connecté.
     *
     * GET /api/wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $wishlist = $this->wishlistService->getUserWishlist($user);

        return $this->successResponse(WishlistResource::collection($wishlist));
    }

    /**
     * Ajouter un produit aux favoris.
     *
     * POST /api/wishlist
     */
    public function store(StoreWishlistRequest $request): JsonResponse
    {
        $user = $request->user();
        $productId = $request->validated()['product_id'];

        $wishlistItem = $this->wishlistService->addProductToWishlist($user, $productId);

        return $this->successResponse(
            new WishlistResource($wishlistItem->load(['product.category', 'product.galleries'])),
            'Produit ajouté aux favoris avec succès.',
            201
        );
    }

    /**
     * Retirer un produit des favoris.
     *
     * DELETE /api/wishlist/{product}
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        $this->wishlistService->removeProductFromWishlist($user, $product->id);

        return $this->successResponse(
            null,
            'Produit retiré des favoris avec succès.'
        );
    }

    /**
     * Vérifier si un produit est déjà en favori.
     *
     * GET /api/wishlist/check/{product}
     */
    public function check(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        $isFavorite = $this->wishlistService->isFavorite($user, $product->id);

        return $this->successResponse([
            'is_favorite' => $isFavorite
        ]);
    }
}
