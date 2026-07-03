<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Budget;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_budget(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Makanan',
            'type' => 'expense'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/budgets', [
                'category_id' => $category->id,
                'amount' => 500000,
                'period' => 'monthly',
                'start_date' => '2026-07-01',
                'end_date' => '2026-07-31'
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Budget created successfully.'
            ]);
    }
}
