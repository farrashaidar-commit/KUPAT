<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Category;

class CategoryService
{
    protected CategoryRepositoryInterface $categoryRepo;

    public function __construct(CategoryRepositoryInterface $categoryRepo)
    {
        $this->categoryRepo = $categoryRepo;
    }

    public function getAllForUser(int $userId): Collection
    {
        return $this->categoryRepo->findByUser($userId);
    }

    public function getById(int $id): ?Category
    {
        return $this->categoryRepo->find($id);
    }

    public function createForUser(int $userId, array $data): Category
    {
        $data['user_id'] = $userId;
        return $this->categoryRepo->create($data);
    }

    public function update(int $id, array $data): bool
    {
        return $this->categoryRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->categoryRepo->delete($id);
    }
}
