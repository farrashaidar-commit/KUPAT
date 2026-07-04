<?php

namespace App\Services;

use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class TransactionService
{
    protected TransactionRepositoryInterface $transactionRepo;

    public function __construct(TransactionRepositoryInterface $transactionRepo)
    {
        $this->transactionRepo = $transactionRepo;
    }

    public function getAllForUser(int $userId, array $filters = []): Collection|LengthAwarePaginator
    {
        return $this->transactionRepo->findByUser($userId, $filters);
    }

    public function getById(int $id): ?Transaction
    {
        return $this->transactionRepo->find($id);
    }

    public function createForUser(int $userId, array $data): Transaction
    {
        return DB::transaction(function () use ($userId, $data) {
            $data['user_id'] = $userId;
            $transaction = $this->transactionRepo->create($data);

            $user = User::findOrFail($userId);
            if ($transaction->type === 'income') {
                $user->balance += $transaction->amount;
            } else {
                $user->balance -= $transaction->amount;
            }
            $user->save();

            return $transaction;
        });
    }

    public function update(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $transaction = $this->transactionRepo->find($id);
            if (!$transaction) {
                return false;
            }

            $user = User::findOrFail($transaction->user_id);
            $oldType = $transaction->type;
            $oldAmount = $transaction->amount;

            $this->adjustUserBalance($user, $oldType, $oldAmount, false);

            $updated = $transaction->update($data);
            if ($updated) {
                $this->adjustUserBalance($user, $transaction->type, $transaction->amount, true);
            } else {
                $this->adjustUserBalance($user, $oldType, $oldAmount, true);
            }

            $user->save();

            return $updated;
        });
    }

    protected function adjustUserBalance(User $user, string $type, float $amount, bool $apply): void
    {
        if ($type === 'income') {
            $user->balance += $apply ? $amount : -$amount;
        } else {
            $user->balance += $apply ? -$amount : $amount;
        }
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $transaction = $this->transactionRepo->find($id);
            if (!$transaction) {
                return false;
            }

            $userId = $transaction->user_id;
            $user = User::findOrFail($userId);

            if ($transaction->type === 'income') {
                $user->balance -= $transaction->amount;
            } else {
                $user->balance += $transaction->amount;
            }
            $user->save();

            return $transaction->delete();
        });
    }

    public function getCategoryExpensesSum(int $userId, int $categoryId, string $startDate, string $endDate): float
    {
        return $this->transactionRepo->getExpensesSumByCategory($userId, $categoryId, $startDate, $endDate);
    }
}
