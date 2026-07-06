<?php

namespace App\Repositories\Eloquent;

use App\Models\FinancialGoal;
use App\Repositories\Contracts\FinancialGoalRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentFinancialGoalRepository extends BaseRepository implements FinancialGoalRepositoryInterface
{
    public function __construct(FinancialGoal $financialGoal)
    {
        parent::__construct($financialGoal);
    }

    public function findByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->orderByDesc('created_at')->get();
    }

    public function findActiveByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->where('status', 'active')->orderByDesc('created_at')->get();
    }
}
