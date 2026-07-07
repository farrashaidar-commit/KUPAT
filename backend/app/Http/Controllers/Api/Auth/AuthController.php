<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\UpdateProfileRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * AuthController
 *
 * REST API Controller handling registration, login, logout, and authenticated user fetch.
 * Returns consistent JSON structures: success, message, and data.
 */
class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Authenticate user and return token.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 200);
    }

    /**
     * Log the authenticated user out (Revoke token).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ], 200);
    }

    /**
     * Retrieve the authenticated user's details.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User details retrieved successfully.',
            'data' => [
                'user' => new UserResource($request->user()),
            ],
        ], 200);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($request->has('name')) {
            $user->name = $request->input('name');
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => new UserResource($user),
            ],
        ], 200);
    }

    /**
     * Redirect the user to Google's OAuth consent screen.
     */
    public function redirectToGoogle(Request $request)
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect') ?? $request->root() . '/api/auth/google/callback';

        if (empty($clientId) || empty($clientSecret)) {
            return response()->json([
                'success' => false,
                'message' => 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your backend .env file.',
            ], 500);
        }

        $scope = urlencode('openid email profile');
        $authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id={$clientId}&redirect_uri={$redirectUri}&response_type=code&scope={$scope}&access_type=offline&prompt=select_account";

        return redirect()->away($authUrl);
    }

    /**
     * Handle Google's OAuth callback, exchange code for tokens, create/find user and return a small HTML page
     * that posts the Kupat token back to opener window and closes the popup.
     */
    public function handleGoogleCallback(Request $request)
    {
        $code = $request->query('code');
        if (!$code) {
            return response()->json(['success' => false, 'message' => 'Missing authorization code.'], 400);
        }

        $tokenEndpoint = 'https://oauth2.googleapis.com/token';
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect') ?? $request->root() . '/api/auth/google/callback';

        if (empty($clientId) || empty($clientSecret)) {
            return response()->json([
                'success' => false,
                'message' => 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your backend .env file.',
            ], 500);
        }

        $response = Http::asForm()->post($tokenEndpoint, [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->ok()) {
            return response()->json(['success' => false, 'message' => 'Failed to exchange code for token.'], 400);
        }

        $tokens = $response->json();
        $accessToken = $tokens['access_token'] ?? null;
        $idToken = $tokens['id_token'] ?? null;

        if (!$idToken) {
            return response()->json(['success' => false, 'message' => 'No id_token returned from Google.'], 400);
        }

        // Validate id_token by calling Google's tokeninfo endpoint
        $tokenInfo = Http::get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $idToken])->json();

        $email = $tokenInfo['email'] ?? null;
        $emailVerified = ($tokenInfo['email_verified'] ?? 'false') === 'true';
        $name = $tokenInfo['name'] ?? ($tokenInfo['given_name'] ?? '');

        if (!$email || !$emailVerified) {
            return response()->json(['success' => false, 'message' => 'Email not verified by Google.'], 400);
        }

        // Find or create user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = User::create([
                'name' => $name ?: $email,
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Return HTML that posts message to opener window with token and user info, then closes popup
        $payload = json_encode(['token' => $token, 'user' => (new UserResource($user))->toArray($request)]);
        $html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Authentication successful</title></head><body>
            <script>
              try {
                window.opener.postMessage({ type: 'kupat_google_auth', payload: $payload }, '*');
              } catch(e) {}
              window.close();
            </script>
            <p>Authentication successful. You can close this window.</p>
            </body></html>";

        return response($html, 200)->header('Content-Type', 'text/html');
    }
}
