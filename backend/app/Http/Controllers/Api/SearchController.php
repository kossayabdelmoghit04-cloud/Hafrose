<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AutocompleteRequest;
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

    public function autocomplete(AutocompleteRequest $request): JsonResponse
    {
        $q = $request->validated()['q'] ?? '';
        $results = $this->searchService->autocomplete($q);

        return $this->successResponse($results);
    }
}
