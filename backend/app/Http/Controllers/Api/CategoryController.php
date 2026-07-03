<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCategoryRequest;
use App\Http\Resources\Api\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getAllForUser($request->user()->id);
        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
            'data' => CategoryResource::collection($categories)
        ], 200);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createForUser($request->user()->id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->getById($id);
        if (!$category || $category->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Category retrieved successfully.',
            'data' => new CategoryResource($category)
        ], 200);
    }

    public function update(StoreCategoryRequest $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getById($id);
        if (!$category || $category->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }
        $this->categoryService->update($id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category->fresh())
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = $this->categoryService->getById($id);
        if (!$category || $category->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }
        $this->categoryService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ], 200);
    }
}
