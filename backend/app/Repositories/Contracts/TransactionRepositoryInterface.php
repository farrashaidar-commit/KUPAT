<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface TransactionRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): Collection|LengthAwarePaginator;
    public function getExpensesSumByCategory(int $userId, int $categoryId, string $startDate, string $endDate): float;
    public function getNetBalanceByUser(int $userId): float;
}
