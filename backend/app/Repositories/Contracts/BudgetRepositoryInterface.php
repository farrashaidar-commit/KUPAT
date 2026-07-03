<?php

namespace App\Repositories\Contracts;

use App\Models\Budget;
use Illuminate\Database\Eloquent\Collection;

interface BudgetRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId): Collection;
    public function findActiveBudgetByCategory(int $userId, int $categoryId, string $date): ?Budget;
}
