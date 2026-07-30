<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CustomerAddressController — CRUD des adresses de livraison client.
 * Toutes les routes sont protégées par auth:sanctum.
 */
class CustomerAddressController extends Controller
{
    use HttpResponses;

    /**
     * GET /api/auth/addresses
     * Lister les adresses de l'utilisateur connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = UserAddress::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse($addresses);
    }

    /**
     * POST /api/auth/addresses
     * Ajouter une nouvelle adresse.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:100',
            'name'        => 'required|string|max:255',
            'address'     => 'required|string|max:500',
            'city'        => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country'     => 'sometimes|string|max:100',
            'phone'       => 'sometimes|nullable|string|max:30',
            'is_default'  => 'sometimes|boolean',
        ]);

        $userId = $request->user()->id;

        // Si c'est la première adresse, elle devient par défaut
        $count = UserAddress::where('user_id', $userId)->count();
        if ($count === 0) {
            $data['is_default'] = true;
        }

        // Si cette adresse est définie par défaut, retirer le default des autres
        if (! empty($data['is_default']) && $data['is_default']) {
            UserAddress::where('user_id', $userId)->update(['is_default' => false]);
        }

        $address = UserAddress::create(['user_id' => $userId] + $data);

        return $this->successResponse($address, 'Adresse ajoutée avec succès.', 201);
    }

    /**
     * PUT /api/auth/addresses/{id}
     * Modifier une adresse existante.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $address = UserAddress::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:100',
            'name'        => 'sometimes|string|max:255',
            'address'     => 'sometimes|string|max:500',
            'city'        => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'country'     => 'sometimes|string|max:100',
            'phone'       => 'sometimes|nullable|string|max:30',
            'is_default'  => 'sometimes|boolean',
        ]);

        if (! empty($data['is_default']) && $data['is_default']) {
            UserAddress::where('user_id', $request->user()->id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $address->update($data);

        return $this->successResponse($address, 'Adresse mise à jour avec succès.');
    }

    /**
     * DELETE /api/auth/addresses/{id}
     * Supprimer une adresse.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = UserAddress::where('user_id', $request->user()->id)->findOrFail($id);
        $wasDefault = $address->is_default;
        $address->delete();

        // Si l'adresse supprimée était la défaut, promouvoir la plus récente
        if ($wasDefault) {
            $next = UserAddress::where('user_id', $request->user()->id)->latest()->first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        return $this->successResponse(null, 'Adresse supprimée avec succès.');
    }

    /**
     * PATCH /api/auth/addresses/{id}/default
     * Définir une adresse comme adresse par défaut.
     */
    public function setDefault(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        // Retirer le flag default de toutes les adresses de l'utilisateur
        UserAddress::where('user_id', $userId)->update(['is_default' => false]);

        // Activer le flag sur l'adresse choisie
        $address = UserAddress::where('user_id', $userId)->findOrFail($id);
        $address->update(['is_default' => true]);

        return $this->successResponse($address, 'Adresse par défaut mise à jour.');
    }
}
