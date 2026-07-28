<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use App\Services\SecurityService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    use HttpResponses;

    protected SecurityService $securityService;

    public function __construct(SecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    public function setup2Fa(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $this->securityService->generate2FaSecret($user);

        return $this->successResponse($data);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $user = $request->user();
        $logs = SecurityAuditLog::where('user_id', $user->id)->latest()->take(20)->get();

        return $this->successResponse($logs);
    }
}
