<?php

namespace App\Repositories\Eloquent;

use App\Models\Budget;
use App\Repositories\Contracts\BudgetRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentBudgetRepository extends BaseRepository implements BudgetRepositoryInterface
{
    public function __construct(Budget $budget)
    {
        parent::__construct($budget);
    }

    public function findByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->with('category')->get();
    }

    public function findActiveBudgetByCategory(int $userId, int $categoryId, string $date): ?Budget
    {
        return $this->model->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();
    }
}
