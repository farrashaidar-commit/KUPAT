<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_returns_csv_with_escaped_transaction_values(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Makan',
            'type' => 'expense',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 25000,
            'type' => 'expense',
            'description' => "Lunch, Dinner\nWith friends",
            'transaction_date' => '2026-07-01 12:00:00',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reports/export', ['type' => 'monthly']);

        $response->assertOk();
        $response->assertJsonPath('success', true);

        $csv = base64_decode($response->json('data.csv'), true);
        $this->assertIsString($csv);
        $this->assertStringContainsString('date,description,category,type,amount', $csv);
        $this->assertStringContainsString('"Lunch, Dinner With friends"', $csv);
    }
}
