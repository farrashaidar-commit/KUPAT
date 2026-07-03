<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SmartFeatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsightsController extends Controller
{
    protected SmartFeatureService $smartFeatureService;

    public function __construct(SmartFeatureService $smartFeatureService)
    {
        $this->smartFeatureService = $smartFeatureService;
    }

    public function getHealthScore(Request $request): JsonResponse
    {
        $health = $this->smartFeatureService->getBudgetHealthScore($request->user()->id);
        return response()->json([
            'success' => true,
            'message' => 'Budget health score retrieved successfully.',
            'data' => $health
        ], 200);
    }

    public function getInsights(Request $request): JsonResponse
    {
        $insights = $this->smartFeatureService->getSmartInsights($request->user()->id);
        return response()->json([
            'success' => true,
            'message' => 'Smart insights retrieved successfully.',
            'data' => $insights
        ], 200);
    }
}
