<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InsightsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_retrieve_health_score_and_insights(): void
    {
        $user = User::factory()->create(['balance' => 500000]);
        $token = $user->createToken('test_token')->plainTextToken;

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Makanan',
            'type' => 'expense'
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 300000,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString()
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100000,
            'type' => 'expense',
            'transaction_date' => now()
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/financial-health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['score', 'status', 'color', 'total_budget', 'total_spent', 'details']
            ]);

        $insightsResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/financial-insights');

        $insightsResponse->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['health_score', 'total_income', 'total_expense', 'net_savings', 'insights']
            ]);
    }
}
