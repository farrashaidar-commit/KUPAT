<?php

namespace App\Services;

use App\Repositories\Contracts\DashboardRepositoryInterface;
use Illuminate\Support\Carbon;

class DashboardService
{
    protected DashboardRepositoryInterface $repository;
    protected SmartFeatureService $smartFeatureService;
    protected BudgetCalculationService $budgetCalculationService;
    protected FinancialHealthService $financialHealthService;

    public function __construct(
        DashboardRepositoryInterface $repository,
        SmartFeatureService $smartFeatureService,
        BudgetCalculationService $budgetCalculationService,
        FinancialHealthService $financialHealthService
    ) {
        $this->repository = $repository;
        $this->smartFeatureService = $smartFeatureService;
        $this->budgetCalculationService = $budgetCalculationService;
        $this->financialHealthService = $financialHealthService;
    }

    public function getDashboard(int $userId): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();
        $prevStart = $now->copy()->subMonthNoOverflow()->startOfMonth()->toDateString();
        $prevEnd = $now->copy()->subMonthNoOverflow()->endOfMonth()->toDateString();

        $user = $this->repository->getUserById($userId);
        $ledgerBalance = $this->repository->getBalanceFromTransactions($userId);
        $incomeData = $this->repository->getMonthlyIncomeExpenses($userId, $startOfMonth, $endOfMonth);
        $previousIncomeData = $this->repository->getPreviousPeriodIncomeExpenses($userId, $prevStart, $prevEnd);
        $categorySpending = $this->repository->getCategorySpending($userId, $startOfMonth, $endOfMonth);
        $cashflow = $this->repository->getCashflowByPeriod($userId, 'monthly');
        $budgets = $this->repository->getBudgetsForUser($userId);
        $goals = $this->repository->getSavingGoalsForUser($userId);
        $notifications = $this->repository->getNotifications($userId, 5);
        $unreadCount = $this->repository->getUnreadNotificationCount($userId);
        $healthData = $this->financialHealthService->calculate($userId, $incomeData, $categorySpending, $budgets, $goals);
        $aiInsights = $this->smartFeatureService->getSmartInsights($userId);

        $statistics = $this->buildStatistics($user, $ledgerBalance, $incomeData, $previousIncomeData, $healthData, $budgets);
        $header = $this->buildHeader($user, $ledgerBalance, $unreadCount);

        return [
            'header' => $header,
            'statistics' => $statistics,
            'cashflow' => $cashflow,
            'expense_categories' => $categorySpending,
            'budget_progress' => $this->budgetCalculationService->calculate($budgets),
            'financial_health' => $healthData,
            'ai_insights' => $aiInsights['insights'] ?? [],
            'recent_transactions' => $this->formatTransactions($this->repository->getRecentTransactions($userId)),
            'notifications' => $this->formatNotifications($notifications),
            'quick_actions' => $this->quickActions(),
        ];
    }

    protected function buildHeader($user, float $ledgerBalance, int $unreadCount): array
    {
        $hour = Carbon::now()->hour;
        $greeting = 'Good Evening';
        if ($hour < 12) {
            $greeting = 'Good Morning';
        } elseif ($hour < 18) {
            $greeting = 'Good Afternoon';
        }

        return [
            'greeting' => $greeting,
            'user_name' => $user->name,
            'avatar' => substr($user->name, 0, 1),
            'today' => Carbon::now()->locale('id')->translatedFormat('l, j F Y'),
            'balance' => $ledgerBalance,
            'formatted_balance' => 'Rp ' . number_format($ledgerBalance, 0, ',', '.'),
            'currency' => 'IDR',
            'unread_notifications' => $unreadCount,
        ];
    }

    protected function buildStatistics($user, float $ledgerBalance, $incomeData, $previousIncomeData, $healthData, $budgets): array
    {
        $totalIncome = $incomeData['income'];
        $totalExpense = $incomeData['expense'];
        $net = $totalIncome - $totalExpense;
        $previousNet = $previousIncomeData['income'] - $previousIncomeData['expense'];
        $growth = $previousNet !== 0 ? round((($net - $previousNet) / max(abs($previousNet), 1)) * 100, 2) : 0;

        $budgetUsage = $this->budgetCalculationService->calculate($budgets)['usage_percentage'] ?? 0;
        $savingsRate = $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 2) : 0;

        return [
            'total_balance' => $this->buildStatItem($ledgerBalance, 'Rp ' . number_format($ledgerBalance, 0, ',', '.'), $growth, $growth >= 0 ? 'up' : 'down', $healthData['status'], '#22c55e', 'wallet'),
            'monthly_income' => $this->buildStatItem($totalIncome, 'Rp ' . number_format($totalIncome, 0, ',', '.'), $this->percentageChange($incomeData['income'], $previousIncomeData['income']), 'up', 'positive', '#10b981', 'trending-up'),
            'monthly_expense' => $this->buildStatItem($totalExpense, 'Rp ' . number_format($totalExpense, 0, ',', '.'), $this->percentageChange($incomeData['expense'], $previousIncomeData['expense']), 'down', 'negative', '#ef4444', 'trending-down'),
            'net_cash_flow' => $this->buildStatItem($net, 'Rp ' . number_format($net, 0, ',', '.'), $growth, $growth >= 0 ? 'up' : 'down', $net >= 0 ? 'positive' : 'negative', $net >= 0 ? '#10b981' : '#ef4444', 'activity'),
            'total_assets' => $this->buildStatItem($ledgerBalance, 'Rp ' . number_format($ledgerBalance, 0, ',', '.'), $this->percentageChange($ledgerBalance, 0), 'up', 'stable', '#6366f1', 'shield-check'),
            'financial_health_score' => $this->buildStatItem($healthData['score'], $healthData['score'] . '%', 0, 'up', $healthData['status'], $healthData['badge_color'], 'heart-pulse'),
            'savings_rate' => $this->buildStatItem($savingsRate, $savingsRate . '%', 0, $savingsRate >= 0 ? 'up' : 'down', 'info', '#38bdf8', 'piggy-bank'),
            'budget_usage' => $this->buildStatItem($budgetUsage, $budgetUsage . '%', 0, $budgetUsage <= 75 ? 'up' : 'down', $budgetUsage <= 75 ? 'safe' : 'warning', '#f97316', 'pie-chart'),
        ];
    }

    protected function buildStatItem($value, string $formatted, float $change, string $trend, string $status, string $color, string $icon): array
    {
        return [
            'value' => $value,
            'formatted_value' => $formatted,
            'percentage_change' => $change,
            'trend' => $trend,
            'status' => $status,
            'color' => $color,
            'icon' => $icon,
        ];
    }

    protected function percentageChange(float $current, float $previous): float
    {
        if ($previous === 0) {
            return $current === 0 ? 0 : 100;
        }
        return round((($current - $previous) / abs($previous)) * 100, 2);
    }

    protected function formatTransactions($transactions): array
    {
        return $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'description' => $transaction->description,
                'category' => $transaction->category->name ?? 'Uncategorized',
                'category_icon' => $transaction->category->icon ?? 'circle',
                'category_color' => $transaction->category->color ?? '#60a5fa',
                'amount' => (float)$transaction->amount,
                'formatted_amount' => 'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                'type' => $transaction->type,
                'date' => $transaction->transaction_date?->toDateString(),
                'color' => $transaction->type === 'income' ? '#10b981' : '#ef4444',
            ];
        })->toArray();
    }

    protected function formatNotifications($notifications): array
    {
        return $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'read' => $notification->read,
                'created_at' => $notification->created_at?->toDateTimeString(),
                'priority' => $notification->read ? 'normal' : 'high',
            ];
        })->toArray();
    }

    protected function quickActions(): array
    {
        return [
            ['id' => 'add_transaction', 'title' => 'Add Transaction', 'icon' => 'plus', 'endpoint' => '/api/transactions', 'method' => 'POST'],
            ['id' => 'create_budget', 'title' => 'Create Budget', 'icon' => 'archive', 'endpoint' => '/api/budgets', 'method' => 'POST'],
            ['id' => 'export_report', 'title' => 'Export Report', 'icon' => 'file-text', 'endpoint' => '/api/reports/export', 'method' => 'POST'],
            ['id' => 'ai_analysis', 'title' => 'Generate AI Analysis', 'icon' => 'cpu', 'endpoint' => '/api/financial-insights', 'method' => 'GET'],
        ];
    }
}
