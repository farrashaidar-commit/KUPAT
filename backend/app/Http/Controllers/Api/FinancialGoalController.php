<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFinancialGoalRequest;
use App\Http\Resources\Api\FinancialGoalResource;
use App\Services\FinancialGoalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialGoalController extends Controller
{
    protected FinancialGoalService $financialGoalService;

    public function __construct(FinancialGoalService $financialGoalService)
    {
        $this->financialGoalService = $financialGoalService;
    }

    public function index(Request $request): JsonResponse
    {
        $financialGoals = $this->financialGoalService->getAllForUser($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Financial goals retrieved successfully.',
            'data' => FinancialGoalResource::collection($financialGoals),
        ], 200);
    }

    public function store(StoreFinancialGoalRequest $request): JsonResponse
    {
        $financialGoal = $this->financialGoalService->createForUser($request->user()->id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Financial goal created successfully.',
            'data' => new FinancialGoalResource($financialGoal),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $financialGoal = $this->financialGoalService->getById($id);

        if (!$financialGoal || $financialGoal->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Financial goal not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Financial goal retrieved successfully.',
            'data' => new FinancialGoalResource($financialGoal),
        ], 200);
    }

    public function update(StoreFinancialGoalRequest $request, int $id): JsonResponse
    {
        $financialGoal = $this->financialGoalService->getById($id);

        if (!$financialGoal || $financialGoal->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Financial goal not found.',
            ], 404);
        }

        $this->financialGoalService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Financial goal updated successfully.',
            'data' => new FinancialGoalResource($financialGoal->fresh()),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $financialGoal = $this->financialGoalService->getById($id);

        if (!$financialGoal || $financialGoal->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Financial goal not found.',
            ], 404);
        }

        $this->financialGoalService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Financial goal deleted successfully.',
        ], 200);
    }
}
