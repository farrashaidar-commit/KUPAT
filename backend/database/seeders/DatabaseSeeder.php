<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin123'),
                'balance' => 5000000,
                'monthly_budget_limit' => 10000000,
            ]
        );

        $test = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'balance' => 1200000,
                'monthly_budget_limit' => 4000000,
            ]
        );

        // Seed sample categories, budgets, transactions and goals for admin user
        $this->call([\Database\Seeders\DemoDataSeeder::class]);
    }
}
