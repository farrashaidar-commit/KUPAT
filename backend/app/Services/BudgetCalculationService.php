<?php

namespace App\Services;

class BudgetCalculationService
{
    public function calculate($budgets): array
    {
        $totalBudget = 0.0;
        $totalUsed = 0.0;
        $status = 'safe';
        $color = '#10b981';
        $remainingDays = 0;

        foreach ($budgets as $budget) {
            $totalBudget += (float)$budget->amount;
            $spent = $budget->category ? $budget->category->transactions()
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date])
                ->sum('amount') : 0;
            $totalUsed += (float)$spent;
        }

        $usage = $totalBudget > 0 ? round(($totalUsed / $totalBudget) * 100, 2) : 0;
        if ($usage > 90) {
            $status = 'danger';
            $color = '#ef4444';
        } elseif ($usage > 70) {
            $status = 'warning';
            $color = '#f59e0b';
        }

        if ($budgets->count() > 0) {
            $remainingDays = 0;
            $now = now();
            foreach ($budgets as $budget) {
                $end = $budget->end_date ? $budget->end_date : $now;
                if ($end->isFuture()) {
                    $remainingDays = max($remainingDays, $now->diffInDays($end, false));
                }
            }
        }

        return [
            'monthly_budget' => (float)$totalBudget,
            'used_budget' => (float)$totalUsed,
            'remaining_budget' => max(0, (float)$totalBudget - (float)$totalUsed),
            'usage_percentage' => $usage,
            'budget_status' => $status,
            'color' => $color,
            'remaining_days' => $remainingDays,
        ];
    }
}
