<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\MediaService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected MediaService     $mediaService,
        protected AdminLogService  $adminLogService,
    ) {}

    /**
     * Obtenir la liste paginée des médias.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 18);
        $media   = $this->mediaService->getPaginatedMedia($perPage);

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
        $file  = $request->file('file');
        $media = $this->mediaService->uploadMedia($file);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_UPLOAD,
            resource:   AdminLog::RESOURCE_MEDIA,
            resourceId: $media->id,
            newValues:  [
                'filename'  => $media->filename ?? $media->name ?? null,
                'mime_type' => $file->getMimeType(),
                'size'      => $file->getSize(),
            ],
        );

        return $this->successResponse(
            new MediaResource($media),
            'Média téléversé avec succès.',
            201
        );
    }

    /**
     * Supprimer un média de la médiathèque.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_DELETE,
            resource:   AdminLog::RESOURCE_MEDIA,
            resourceId: $id,
        );

        $this->mediaService->deleteMedia($id);

        return $this->successResponse(null, 'Média supprimé avec succès.');
    }
}
