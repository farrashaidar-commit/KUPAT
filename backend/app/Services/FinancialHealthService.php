<?php

namespace App\Services;

use Illuminate\Support\Str;

class FinancialHealthService
{
    public function calculate(int $userId, array $monthlyData, array $categorySpending, $budgets, $goals): array
    {
        $income = $monthlyData['income'];
        $expense = $monthlyData['expense'];
        $savingsRatio = $income > 0 ? round((($income - $expense) / $income) * 100, 2) : 0;
        $expenseRatio = $income > 0 ? round(($expense / $income) * 100, 2) : 0;
        $budgetCompliance = $this->calculateBudgetCompliance($budgets);
        $goalCompletion = $this->calculateGoalCompletion($goals);

        $score = 100;
        $score -= max(0, $expenseRatio - 40) * 0.5;
        $score -= max(0, 100 - $savingsRatio) * 0.2;
        $score -= max(0, 100 - $budgetCompliance) * 0.2;
        $score -= max(0, 100 - $goalCompletion) * 0.1;
        $score = max(0, min(100, round($score)));

        $status = 'Excellent';
        $color = '#22c55e';
        if ($score < 50) {
            $status = 'Critical';
            $color = '#ef4444';
        } elseif ($score < 75) {
            $status = 'Warning';
            $color = '#f59e0b';
        }

        return [
            'score' => $score,
            'status' => $status,
            'description' => $this->descriptionForScore($score),
            'recommendation' => $this->recommendationForScore($score),
            'badge_color' => $color,
            'savings_ratio' => $savingsRatio,
            'expense_ratio' => $expenseRatio,
            'budget_compliance' => $budgetCompliance,
            'goal_completion' => $goalCompletion,
        ];
    }

    protected function calculateBudgetCompliance($budgets): float
    {
        if ($budgets->isEmpty()) {
            return 100;
        }

        $compliant = 0;
        foreach ($budgets as $budget) {
            $spent = $budget->category ? $budget->category->transactions()
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date])
                ->sum('amount') : 0;
            $percentage = $budget->amount > 0 ? ($spent / $budget->amount) * 100 : 0;
            if ($percentage <= 100) {
                $compliant += 1;
            }
        }

        return $budgets->count() > 0 ? round(($compliant / $budgets->count()) * 100, 2) : 100;
    }

    protected function calculateGoalCompletion($goals): float
    {
        if ($goals->isEmpty()) {
            return 100;
        }

        $total = 0;
        foreach ($goals as $goal) {
            $ratio = $goal->target_amount > 0 ? min(100, ($goal->current_amount / $goal->target_amount) * 100) : 0;
            $total += $ratio;
        }

        return round($total / $goals->count(), 2);
    }

    protected function descriptionForScore(int $score): string
    {
        if ($score >= 75) {
            return 'Your financial health is strong. Keep maintaining steady income and controlled spending.';
        }

        if ($score >= 50) {
            return 'Your finances are stable but could improve. Focus on reducing high expenses and sticking to budgets.';
        }

        return 'Your financial health is at risk. Reduce non-essential spending and improve savings habits.';
    }

    protected function recommendationForScore(int $score): string
    {
        if ($score >= 75) {
            return 'Continue tracking your budgets and save for upcoming goals.';
        }

        if ($score >= 50) {
            return 'Review expenses and allocate more to savings to raise your score.';
        }

        return 'Prioritize essential costs, reduce large discretionary spendings, and increase your savings contributions.';
    }
}
