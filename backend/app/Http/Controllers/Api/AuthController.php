<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|max:100',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:15',
            'role' => 'nullable|string|in:customer,penyewa',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
        ]);

        $role = $request->role ?? 'customer';
        $user->assignRole($role);

        $token = JWTAuth::fromUser($user);

        return $this->success([
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ], 'Registration successful', 201);
    }

    /**
     * Authenticate user and return JWT token.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $credentials = $request->only('email', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        /** @var User $user */
        $user = auth('api')->user();

        if (! $user->is_active) {
            auth('api')->logout();
            return $this->error('Account is deactivated. Please contact admin.', 403);
        }

        return $this->success([
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ], 'Login successful');
    }

    /**
     * Get authenticated user profile.
     */
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $this->success(
            $user->load('roles', 'permissions'),
            'User profile retrieved'
        );
    }

    /**
     * Logout (invalidate token).
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return $this->success(null, 'Successfully logged out');
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();

        return $this->success([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ], 'Token refreshed');
    }
}
