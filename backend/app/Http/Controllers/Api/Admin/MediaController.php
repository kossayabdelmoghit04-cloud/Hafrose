<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Resources\MediaResource;
use App\Services\MediaService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    use HttpResponses;

    protected MediaService $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Obtenir la liste paginée des médias.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 18);
        $media = $this->mediaService->getPaginatedMedia($perPage);

        return response()->json([
            'success' => true,
            'message' => null,
            'errors'  => null,
            'data'    => MediaResource::collection($media),
            'meta'    => [
                'current_page' => $media->currentPage(),
                'last_page'    => $media->lastPage(),
                'per_page'     => $media->perPage(),
                'total'        => $media->total(),
            ],
        ]);
    }

    /**
     * Uploader un nouveau média dans la médiathèque.
     */
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $media = $this->mediaService->uploadMedia($file);

        return $this->successResponse(
            new MediaResource($media),
            'Média téléversé avec succès.',
            201
        );
    }

    /**
     * Supprimer un média de la médiathèque.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->mediaService->deleteMedia($id);
        return $this->successResponse(null, 'Média supprimé avec succès.');
    }
}
