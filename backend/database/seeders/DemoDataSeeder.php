<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Budget;
use App\Models\Transaction;
use App\Models\SavingGoal;
use App\Models\Notification;
use App\Models\Insight;
use App\Models\User;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@gmail.com')->first();
        if (!$user) return;

        // categories
        $food = Category::updateOrCreate(['user_id' => $user->id, 'name' => 'Food'], ['type' => 'expense', 'color' => '#f97316', 'icon' => 'utensils']);
        $salary = Category::updateOrCreate(['user_id' => $user->id, 'name' => 'Salary'], ['type' => 'income', 'color' => '#10b981', 'icon' => 'credit-card']);
        $ent = Category::updateOrCreate(['user_id' => $user->id, 'name' => 'Entertainment'], ['type' => 'expense', 'color' => '#60a5fa', 'icon' => 'film']);

        // budgets
        $start = Carbon::now()->startOfMonth()->toDateString();
        $end = Carbon::now()->endOfMonth()->toDateString();
        Budget::updateOrCreate(['user_id' => $user->id, 'category_id' => $food->id], ['amount' => 2000000, 'period' => 'monthly', 'start_date' => $start, 'end_date' => $end]);

        // transactions
        Transaction::create(['user_id' => $user->id, 'category_id' => $salary->id, 'amount' => 7000000, 'type' => 'income', 'description' => 'Monthly Salary', 'transaction_date' => Carbon::now()->subDays(3)->toDateTimeString()]);
        Transaction::create(['user_id' => $user->id, 'category_id' => $food->id, 'amount' => 150000, 'type' => 'expense', 'description' => 'Groceries', 'transaction_date' => Carbon::now()->subDays(2)->toDateTimeString()]);
        Transaction::create(['user_id' => $user->id, 'category_id' => $ent->id, 'amount' => 75000, 'type' => 'expense', 'description' => 'Movie', 'transaction_date' => Carbon::now()->subDays(1)->toDateTimeString()]);

        // saving goal
        SavingGoal::updateOrCreate(['user_id' => $user->id, 'title' => 'Vacation Fund'], ['target_amount' => 5000000, 'current_amount' => 1000000, 'target_date' => Carbon::now()->addMonths(6)->toDateString()]);

        // notifications
        Notification::create(['user_id' => $user->id, 'type' => 'info', 'title' => 'Welcome to KUPAT', 'message' => 'Your demo account is ready', 'read' => false]);

        // insights
        Insight::create(['user_id' => $user->id, 'type' => 'success', 'title' => 'Rasio Menabung Sehat', 'message' => 'Anda berhasil menabung 30% dari total pendapatan bulan ini.']);
    }
}
