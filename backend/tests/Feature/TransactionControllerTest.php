<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_transaction_income_updates_balance(): void
    {
        $user = User::factory()->create(['balance' => 1000]);
        $token = $user->createToken('test_token')->plainTextToken;

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Gaji',
            'type' => 'income'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/transactions', [
                'category_id' => $category->id,
                'amount' => 5000,
                'type' => 'income',
                'description' => 'Gaji Bulanan',
                'transaction_date' => '2026-07-01 10:00:00'
            ]);

        $response->assertStatus(201);
        $user->refresh();
        $this->assertEquals(6000, $user->balance);
    }
}
