<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * AuthTest
 *
 * Feature tests verifying the KUPAT REST API authentication endpoints:
 * register, login, logout, and authenticated user fetch.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful registration.
     */
    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User registered successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'created_at', 'updated_at'],
                    'token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
        ]);
    }

    /**
     * Test registration validation errors.
     */
    public function test_registration_requires_validation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation error.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['name', 'email', 'password'],
            ]);
    }

    /**
     * Test successful login.
     */
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type',
                ],
            ]);
    }

    /**
     * Test the seeded admin account can log in with the requested credentials.
     */
    public function test_seeded_admin_account_can_login(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@gmail.com',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ]);
    }

    /**
     * Test failed login with invalid credentials.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid login credentials.',
            ]);
    }

    /**
     * Test fetching authenticated user.
     */
    public function test_authenticated_user_can_retrieve_details(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User details retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                ],
            ]);
    }

    /**
     * Test unauthenticated access is protected.
     */
    public function test_unauthenticated_user_cannot_access_user_details(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test successful logout.
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        file_put_contents(storage_path('logs/debug.log'), "Logout Response Status: " . $response->status() . "\nContent: " . $response->getContent() . "\n");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful.',
            ]);

        // Access authenticated route again to verify the token is invalidated
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $retryResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        file_put_contents(storage_path('logs/debug.log'), "Retry Response Status: " . $retryResponse->status() . "\nContent: " . $retryResponse->getContent() . "\n", FILE_APPEND);

        $retryResponse->assertStatus(401);
    }
}
