<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface TransactionRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): Collection;
    public function getExpensesSumByCategory(int $userId, int $categoryId, string $startDate, string $endDate): float;
}
