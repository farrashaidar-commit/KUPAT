<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_category(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/categories', [
                'name' => 'Gaji',
                'type' => 'income',
                'color' => '#10b981',
                'icon' => 'bank'
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Category created successfully.'
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'type', 'color', 'icon']
            ]);
    }

    public function test_user_can_list_categories(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        Category::create([
            'user_id' => $user->id,
            'name' => 'Makanan',
            'type' => 'expense',
            'color' => '#ef4444',
            'icon' => 'utensils'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonCount(1, 'data');
    }
}
