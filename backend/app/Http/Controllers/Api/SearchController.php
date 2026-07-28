<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\SearchService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use HttpResponses;

    protected SearchService $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $q = $request->query('q', '');
        $results = $this->searchService->autocomplete($q);

        return $this->successResponse($results);
    }
}
