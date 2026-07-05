<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Transaction;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $type = $request->input('type', 'monthly');
        $user = $request->user();

        // simple period handling
        $now = Carbon::now();
        if ($type === 'monthly') {
            $start = $now->copy()->startOfMonth();
            $end = $now->copy()->endOfMonth();
        } elseif ($type === 'yearly') {
            $start = $now->copy()->startOfYear();
            $end = $now->copy()->endOfYear();
        } else {
            $start = $now->copy()->startOfMonth();
            $end = $now->copy()->endOfMonth();
        }

        $transactions = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$start->startOfDay()->toDateTimeString(), $end->endOfDay()->toDateTimeString()])
            ->with('category')
            ->orderBy('transaction_date', 'asc')
            ->get();

        $csv = "date,description,category,type,amount\n";
        foreach ($transactions as $t) {
            $description = $this->sanitizeCsvValue($t->description ?? '');
            $category = $this->sanitizeCsvValue($t->category->name ?? 'General');
            $csv .= sprintf("%s,%s,%s,%s,%.2f\n",
                $t->transaction_date->toDateString(),
                $description,
                $category,
                $t->type,
                $t->amount
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Report generated.',
            'data' => [
                'csv' => base64_encode($csv),
                'filename' => 'report_' . $type . '_' . now()->format('Ymd') . '.csv'
            ]
        ], 200);
    }

    protected function sanitizeCsvValue(string $value): string
    {
        $value = str_replace(["\r", "\n"], ' ', $value);
        $value = str_replace('"', '""', $value);

        if (str_contains($value, ',') || str_contains($value, '"') || str_contains($value, ' ')) {
            return '"' . $value . '"';
        }

        return $value;
    }
}
