<?php

namespace App\Services;

use App\Models\FinancialGoal;
use App\Repositories\Contracts\FinancialGoalRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class FinancialGoalService
{
    protected FinancialGoalRepositoryInterface $financialGoalRepo;

    public function __construct(FinancialGoalRepositoryInterface $financialGoalRepo)
    {
        $this->financialGoalRepo = $financialGoalRepo;
    }

    public function getAllForUser(int $userId): Collection
    {
        return $this->financialGoalRepo->findByUser($userId);
    }

    public function getById(int $id): ?FinancialGoal
    {
        return $this->financialGoalRepo->find($id);
    }

    public function createForUser(int $userId, array $data): FinancialGoal
    {
        $data['user_id'] = $userId;

        return $this->financialGoalRepo->create($data);
    }

    public function update(int $id, array $data): bool
    {
        return $this->financialGoalRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->financialGoalRepo->delete($id);
    }
}
