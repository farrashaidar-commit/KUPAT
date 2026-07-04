<?php

namespace App\Repositories\Eloquent;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\SavingGoal;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\Contracts\DashboardRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class EloquentDashboardRepository implements DashboardRepositoryInterface
{
    public function getUserById(int $userId)
    {
        return User::find($userId);
    }

    public function getRecentTransactions(int $userId, int $limit = 10): Collection
    {
        return Transaction::with('category')
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getMonthlyIncomeExpenses(int $userId, string $startDate, string $endDate): array
    {
        $income = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $expense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        return ['income' => (float)$income, 'expense' => (float)$expense];
    }

    public function getPreviousPeriodIncomeExpenses(int $userId, string $startDate, string $endDate): array
    {
        return $this->getMonthlyIncomeExpenses($userId, $startDate, $endDate);
    }

    public function getCashflowByPeriod(int $userId, string $period = 'monthly'): array
    {
        $now = Carbon::now();

        if ($period === 'weekly') {
            $start = $now->copy()->startOfWeek();
            $end = $now->copy()->endOfWeek();
            $interval = $start->copy();
            $format = 'Y-m-d';
        } elseif ($period === 'yearly') {
            $start = $now->copy()->startOfYear();
            $end = $now->copy()->endOfYear();
            $interval = $start->copy();
            $format = 'Y-m';
        } else {
            $start = $now->copy()->startOfMonth();
            $end = $now->copy()->endOfMonth();
            $interval = $start->copy();
            $format = 'Y-m-d';
        }

        $dates = [];
        while ($interval->lte($end)) {
            $dates[$interval->format($format)] = ['income' => 0.0, 'expense' => 0.0];
            $interval->addDay();
            if ($period === 'yearly' && $interval->day !== 1) {
                $interval->startOfMonth();
            }
        }

        $transactions = Transaction::where('user_id', $userId)
            ->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()])
            ->get(['transaction_date', 'amount', 'type']);

        foreach ($transactions as $transaction) {
            $key = $transaction->transaction_date->format($format);
            if (array_key_exists($key, $dates)) {
                $dates[$key][$transaction->type] += (float)$transaction->amount;
            }
        }

        return array_map(fn($value, $date) => [
            'date' => $date,
            'income' => $value['income'],
            'expense' => $value['expense'],
            'net' => $value['income'] - $value['expense'],
        ], $dates, array_keys($dates));
    }

    public function getCategorySpending(int $userId, string $startDate, string $endDate): array
    {
        $categories = Category::where('user_id', $userId)->get()->keyBy('id');

        $spending = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('category_id, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();

        $total = $spending->sum('total');
        return $spending->map(function ($item) use ($categories, $total) {
            $category = $categories->get($item->category_id);
            return [
                'category' => $category?->name ?? 'Uncategorized',
                'amount' => (float)$item->total,
                'percentage' => $total > 0 ? round(((float)$item->total / $total) * 100, 2) : 0,
                'color' => $category?->color ?? '#60a5fa',
                'icon' => $category?->icon ?? 'circle',
                'transaction_count' => (int)$item->count,
            ];
        })->toArray();
    }

    public function getBalanceFromTransactions(int $userId): float
    {
        $income = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->sum('amount');

        $expense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->sum('amount');

        return (float)$income - (float)$expense;
    }

    public function getBudgetsForUser(int $userId)
    {
        return Budget::with('category')
            ->where('user_id', $userId)
            ->get();
    }

    public function getSavingGoalsForUser(int $userId)
    {
        return SavingGoal::where('user_id', $userId)
            ->orderByDesc('target_date')
            ->get();
    }

    public function getNotifications(int $userId, int $limit = 5): Collection
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getUnreadNotificationCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('read', false)
            ->count();
    }
}
