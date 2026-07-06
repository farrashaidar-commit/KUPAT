<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialGoalControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_financial_goal(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/financial-goals', [
                'name' => 'Dana Liburan',
                'target_amount' => 5000000,
                'current_amount' => 1500000,
                'deadline' => '2026-12-31',
                'description' => 'Tabungan untuk liburan akhir tahun',
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Financial goal created successfully.'
            ]);
    }
}
