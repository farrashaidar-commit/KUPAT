<?php

namespace App\Repositories\Eloquent;

use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentTransactionRepository extends BaseRepository implements TransactionRepositoryInterface
{
    public function __construct(Transaction $transaction)
    {
        parent::__construct($transaction);
    }

    public function findByUser(int $userId, array $filters = []): Collection
    {
        $query = $this->model->where('user_id', $userId)->with('category');

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['start_date'])) {
            $query->where('transaction_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('transaction_date', '<=', $filters['end_date']);
        }

        return $query->orderBy('transaction_date', 'desc')->get();
    }

    public function getExpensesSumByCategory(int $userId, int $categoryId, string $startDate, string $endDate): float
    {
        return (float) $this->model->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');
    }
}
