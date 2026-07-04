<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\UserResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function dashboard(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getDashboard($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully.',
            'data' => $data,
        ], 200);
    }

    public function header(Request $request): JsonResponse
    {
        $dashboardData = $this->dashboardService->getDashboard($request->user()->id);

        $data = [
            'user' => new UserResource($request->user()),
            'greeting' => $dashboardData['header']['greeting'],
            'today' => $dashboardData['header']['today'],
            'notification_count' => $dashboardData['header']['unread_notifications'],
            'currency' => $dashboardData['header']['currency'],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard header retrieved.',
            'data' => $data
        ], 200);
    }
}
