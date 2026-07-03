<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreBudgetRequest;
use App\Http\Resources\Api\BudgetResource;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    protected BudgetService $budgetService;

    public function __construct(BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    public function index(Request $request): JsonResponse
    {
        $budgets = $this->budgetService->getAllForUser($request->user()->id);
        return response()->json([
            'success' => true,
            'message' => 'Budgets retrieved successfully.',
            'data' => BudgetResource::collection($budgets->load('category'))
        ], 200);
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $budget = $this->budgetService->createForUser($request->user()->id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Budget created successfully.',
            'data' => new BudgetResource($budget->load('category'))
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($id);
        if (!$budget || $budget->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found.'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Budget retrieved successfully.',
            'data' => new BudgetResource($budget->load('category'))
        ], 200);
    }

    public function update(StoreBudgetRequest $request, int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($id);
        if (!$budget || $budget->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found.'
            ], 404);
        }
        $this->budgetService->update($id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Budget updated successfully.',
            'data' => new BudgetResource($budget->fresh()->load('category'))
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($id);
        if (!$budget || $budget->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found.'
            ], 404);
        }
        $this->budgetService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully.'
        ], 200);
    }
}
