<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface DashboardRepositoryInterface
{
    public function getUserById(int $userId);
    public function getRecentTransactions(int $userId, int $limit = 10): Collection;
    public function getMonthlyIncomeExpenses(int $userId, string $startDate, string $endDate): array;
    public function getPreviousPeriodIncomeExpenses(int $userId, string $startDate, string $endDate): array;
    public function getCashflowByPeriod(int $userId, string $period = 'monthly'): array;
    public function getCategorySpending(int $userId, string $startDate, string $endDate): array;
    public function getBalanceFromTransactions(int $userId): float;
    public function getBudgetsForUser(int $userId);
    public function getSavingGoalsForUser(int $userId);
    public function getNotifications(int $userId, int $limit = 5): Collection;
    public function getUnreadNotificationCount(int $userId): int;
}
