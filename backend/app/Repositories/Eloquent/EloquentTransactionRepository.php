<?php

namespace App\Repositories\Eloquent;

use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentTransactionRepository extends BaseRepository implements TransactionRepositoryInterface
{
    public function __construct(Transaction $transaction)
    {
        parent::__construct($transaction);
    }

    public function findByUser(int $userId, array $filters = []): Collection|LengthAwarePaginator
    {
        $query = $this->model->where('user_id', $userId)->with('category');

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['start_date'])) {
            $query->where('transaction_date', '>=', $filters['start_date'] . ' 00:00:00');
        }

        if (!empty($filters['end_date'])) {
            $query->where('transaction_date', '<=', $filters['end_date'] . ' 23:59:59');
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('description', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('amount', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = $filters['sort_by'] ?? 'transaction_date';
        if (!in_array($sortBy, ['transaction_date', 'amount', 'type'])) {
            $sortBy = 'transaction_date';
        }

        $sortOrder = strtolower($filters['sort_order'] ?? 'desc');
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        if (!empty($filters['per_page']) || !empty($filters['page'])) {
            $perPage = max(1, (int) ($filters['per_page'] ?? 20));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    public function getExpensesSumByCategory(int $userId, int $categoryId, string $startDate, string $endDate): float
    {
        return (float) $this->model->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');
    }

    public function getNetBalanceByUser(int $userId): float
    {
        $income = (float) $this->model->where('user_id', $userId)
            ->where('type', 'income')
            ->sum('amount');

        $expense = (float) $this->model->where('user_id', $userId)
            ->where('type', 'expense')
            ->sum('amount');

        return $income - $expense;
    }
}
