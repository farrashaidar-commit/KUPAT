<?php

namespace App\Services;

use App\Repositories\Contracts\BudgetRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Budget;

class BudgetService
{
    protected BudgetRepositoryInterface $budgetRepo;

    public function __construct(BudgetRepositoryInterface $budgetRepo)
    {
        $this->budgetRepo = $budgetRepo;
    }

    public function getAllForUser(int $userId): Collection
    {
        return $this->budgetRepo->findByUser($userId);
    }

    public function getById(int $id): ?Budget
    {
        return $this->budgetRepo->find($id);
    }

    public function createForUser(int $userId, array $data): Budget
    {
        $data['user_id'] = $userId;
        return $this->budgetRepo->create($data);
    }

    public function update(int $id, array $data): bool
    {
        return $this->budgetRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->budgetRepo->delete($id);
    }

    public function getActiveBudgetForCategory(int $userId, int $categoryId, string $date): ?Budget
    {
        return $this->budgetRepo->findActiveBudgetByCategory($userId, $categoryId, $date);
    }
}
