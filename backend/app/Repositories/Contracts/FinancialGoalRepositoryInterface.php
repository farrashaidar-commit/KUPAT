<?php

namespace App\Repositories\Contracts;

use App\Models\FinancialGoal;
use Illuminate\Database\Eloquent\Collection;

interface FinancialGoalRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId): Collection;
    public function findActiveByUser(int $userId): Collection;
}
