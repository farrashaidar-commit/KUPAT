<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTransactionRequest;
use App\Http\Resources\Api\TransactionResource;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'category_id', 'start_date', 'end_date']);
        $transactions = $this->transactionService->getAllForUser($request->user()->id, $filters);
        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved successfully.',
            'data' => TransactionResource::collection($transactions->load('category'))
        ], 200);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $this->transactionService->createForUser($request->user()->id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully.',
            'data' => new TransactionResource($transaction->load('category'))
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($id);
        if (!$transaction || $transaction->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found.'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Transaction retrieved successfully.',
            'data' => new TransactionResource($transaction->load('category'))
        ], 200);
    }

    public function update(StoreTransactionRequest $request, int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($id);
        if (!$transaction || $transaction->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found.'
            ], 404);
        }
        $this->transactionService->update($id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Transaction updated successfully.',
            'data' => new TransactionResource($transaction->fresh()->load('category'))
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($id);
        if (!$transaction || $transaction->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found.'
            ], 404);
        }
        $this->transactionService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully.'
        ], 200);
    }
}
