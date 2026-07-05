<?php

namespace App\Services;

use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\BudgetRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class SmartFeatureService
{
    protected TransactionRepositoryInterface $transactionRepo;
    protected BudgetRepositoryInterface $budgetRepo;
    protected UserRepositoryInterface $userRepo;

    public function __construct(
        TransactionRepositoryInterface $transactionRepo,
        BudgetRepositoryInterface $budgetRepo,
        UserRepositoryInterface $userRepo
    ) {
        $this->transactionRepo = $transactionRepo;
        $this->budgetRepo = $budgetRepo;
        $this->userRepo = $userRepo;
    }

    public function getBudgetHealthScore(int $userId): array
    {
        $user = User::findOrFail($userId);
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->startOfDay()->toDateTimeString();
        $endOfMonth = $now->copy()->endOfMonth()->endOfDay()->toDateTimeString();

        $budgets = $this->budgetRepo->findByUser($userId);
        
        $totalBudgetLimit = 0;
        $totalSpentInBudgetedCategories = 0;
        $exceededCount = 0;
        $totalCategories = count($budgets);

        $details = [];
        $rangeTotals = [];

        foreach ($budgets as $budget) {
            $budgetStart = $budget->start_date ? (method_exists($budget->start_date, 'toDateTimeString') ? $budget->start_date->startOfDay()->toDateTimeString() : $budget->start_date) : $startOfMonth;
            $budgetEnd = $budget->end_date ? (method_exists($budget->end_date, 'toDateTimeString') ? $budget->end_date->endOfDay()->toDateTimeString() : $budget->end_date) : $endOfMonth;
            $rangeKey = $budgetStart . '|' . $budgetEnd;

            if (!isset($rangeTotals[$rangeKey])) {
                $rangeTotals[$rangeKey] = Transaction::where('user_id', $userId)
                    ->where('type', 'expense')
                    ->whereBetween('transaction_date', [$budgetStart, $budgetEnd])
                    ->whereNotNull('category_id')
                    ->selectRaw('category_id, SUM(amount) as total')
                    ->groupBy('category_id')
                    ->pluck('total', 'category_id')
                    ->mapWithKeys(fn ($total, $categoryId) => [(int) $categoryId => (float) $total]);
            }

            $spent = (float) ($rangeTotals[$rangeKey][$budget->category_id] ?? 0);
            $totalBudgetLimit += $budget->amount;
            $totalSpentInBudgetedCategories += $spent;

            $percentage = $budget->amount > 0 ? ($spent / $budget->amount) * 100 : 0;
            $overby = 0;
            if ($spent > $budget->amount) {
                $exceededCount++;
                $overby = $spent - $budget->amount;
            }

            $details[] = [
                'category_id' => $budget->category_id,
                'category_name' => $budget->category->name ?? 'Category',
                'limit' => $budget->amount,
                'spent' => $spent,
                'percentage' => round($percentage, 2),
                'exceeded' => $spent > $budget->amount,
                'over_by' => $overby
            ];
        }

        $score = 100;

        if ($totalCategories > 0) {
            $exceededRatio = $exceededCount / $totalCategories;
            $score -= $exceededRatio * 30;
        }

        if ($totalBudgetLimit > 0 && $totalSpentInBudgetedCategories > $totalBudgetLimit) {
            $overallOverspendingRatio = ($totalSpentInBudgetedCategories - $totalBudgetLimit) / $totalBudgetLimit;
            $score -= min($overallOverspendingRatio * 40, 40);
        }

        $ledgerBalance = $this->transactionRepo->getNetBalanceByUser($userId);

        if ($ledgerBalance < 0) {
            $score -= 30;
        } elseif ($totalBudgetLimit > 0 && $ledgerBalance < ($totalBudgetLimit * 0.1)) {
            $score -= 15;
        }

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
            'color' => $color,
            'total_budget' => $totalBudgetLimit,
            'total_spent' => $totalSpentInBudgetedCategories,
            'details' => $details
        ];
    }

    public function getSmartInsights(int $userId): array
    {
        $healthData = $this->getBudgetHealthScore($userId);
        
        $insights = [];

        if ($healthData['score'] >= 75) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Kondisi Keuangan Sehat',
                'message' => 'Luar biasa! Skor kesehatan anggaran Anda berada di level ' . $healthData['status'] . ' (' . $healthData['score'] . '). Pertahankan pola pengeluaran terkendali ini!'
            ];
        } elseif ($healthData['score'] >= 50) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Perlu Penyesuaian Anggaran',
                'message' => 'Skor kesehatan anggaran Anda saat ini bernilai ' . $healthData['score'] . ' (' . $healthData['status'] . '). Beberapa kategori telah melebihi batas atau saldo Anda hampir habis. Coba kurangi pengeluaran non-esensial.'
            ];
        } else {
            $insights[] = [
                'type' => 'danger',
                'title' => 'Bahaya! Keuangan Kritis',
                'message' => 'Skor kesehatan Anda bernilai ' . $healthData['score'] . ' (' . $healthData['status'] . '). Pengeluaran Anda melebihi batas anggaran secara signifikan atau saldo Anda negatif. Harap segera evaluasi pos pengeluaran Anda.'
            ];
        }

        $overspentCategories = array_filter($healthData['details'], function($item) {
            return $item['exceeded'];
        });

        if (count($overspentCategories) > 0) {
            foreach ($overspentCategories as $cat) {
                $insights[] = [
                    'type' => 'warning',
                    'title' => 'Anggaran ' . $cat['category_name'] . ' Jebol',
                    'message' => 'Anda telah menghabiskan Rp ' . number_format($cat['spent'], 0, ',', '.') . ' dari batas Rp ' . number_format($cat['limit'], 0, ',', '.') . ' pada kategori ' . $cat['category_name'] . '.'
                ];
            }
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->startOfDay()->toDateTimeString();
        $endOfMonth = $now->copy()->endOfMonth()->endOfDay()->toDateTimeString();

        $transactions = $this->transactionRepo->findByUser($userId, [
            'start_date' => $startOfMonth,
            'end_date' => $endOfMonth
        ]);

        $totalIncome = 0;
        $totalExpense = 0;

        foreach ($transactions as $t) {
            if ($t->type === 'income') {
                $totalIncome += $t->amount;
            } else {
                $totalExpense += $t->amount;
            }
        }

        if ($totalIncome > 0) {
            $savingsRate = (($totalIncome - $totalExpense) / $totalIncome) * 100;
            if ($savingsRate > 20) {
                $insights[] = [
                    'type' => 'success',
                    'title' => 'Rasio Menabung Sehat',
                    'message' => 'Anda berhasil menabung ' . round($savingsRate, 1) . '% dari total pendapatan bulan ini. Ini di atas target rekomendasi finansial (20%).'
                ];
            } elseif ($savingsRate < 0) {
                $insights[] = [
                    'type' => 'danger',
                    'title' => 'Defisit Bulan Ini',
                    'message' => 'Pengeluaran Anda bulan ini melebihi pendapatan sebesar Rp ' . number_format(abs($totalIncome - $totalExpense), 0, ',', '.') . '. Direkomendasikan mengecek catatan pengeluaran.'
                ];
            } else {
                $insights[] = [
                    'type' => 'info',
                    'title' => 'Rasio Menabung Rendah',
                    'message' => 'Rasio tabungan Anda bulan ini adalah ' . round($savingsRate, 1) . '%. Tingkatkan sedikit lagi demi mencapai target keuangan jangka panjang.'
                ];
            }
        } else {
            $insights[] = [
                'type' => 'info',
                'title' => 'Belum Ada Pendapatan Tercatat',
                'message' => 'Segera catat pendapatan bulanan Anda agar tracker keuangan KUPAT dapat memproyeksikan rasio tabungan yang akurat.'
            ];
        }

        return [
            'health_score' => $healthData['score'],
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_savings' => $totalIncome - $totalExpense,
            'insights' => $insights
        ];
    }
}
