<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:pengguna',
            'password' => 'required|string|min:6|confirmed',
            'no_telp' => 'nullable|string|max:15',
            'peran_pengguna' => 'required|in:pemilik,penyewa',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $pengguna = Pengguna::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'no_telp' => $request->no_telp,
            'peran_pengguna' => $request->peran_pengguna,
            'verifikasi_ktp' => false,
        ]);

        $token = JWTAuth::fromUser($pengguna);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'user' => $pengguna,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = auth()->user();

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'nama' => $user->nama,
                'email' => $user->email,
                'no_telp' => $user->no_telp,
                'peran_pengguna' => $user->peran_pengguna,
                'verifikasi_ktp' => $user->verifikasi_ktp,
            ],
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60
        ]);
    }

    // Google Login Redirect
        public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Google Login Callback
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Cari user berdasarkan email atau google_id
            $pengguna = Pengguna::where('email', $googleUser->getEmail())
                ->orWhere('google_id', $googleUser->getId())
                ->first();

            if (!$pengguna) {
                // Buat user baru dengan role default 'penyewa'
                $pengguna = Pengguna::create([
                    'nama' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'peran_pengguna' => 'penyewa',
                    'google_id' => $googleUser->getId(),
                    'verifikasi_ktp' => false,
                ]);
            } else {
                // Update google_id jika belum ada
                if (!$pengguna->google_id) {
                    $pengguna->google_id = $googleUser->getId();
                    $pengguna->save();
                }
            }

            $token = JWTAuth::fromUser($pengguna);

            // Redirect ke frontend dengan token
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $redirectUrl = $frontendUrl . '/auth/callback?token=' . $token . '&user=' . urlencode(json_encode([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama' => $pengguna->nama,
                'email' => $pengguna->email,
                'peran_pengguna' => $pengguna->peran_pengguna,
            ]));

            return redirect($redirectUrl);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google login gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    // Logout
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout gagal'
            ], 500);
        }
    }

    // Get User Profile
    public function me()
    {
        $user = auth()->user();
        return response()->json([
            'success' => true,
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'nama' => $user->nama,
                'email' => $user->email,
                'no_telp' => $user->no_telp,
                'peran_pengguna' => $user->peran_pengguna,
                'verifikasi_ktp' => $user->verifikasi_ktp,
                'foto_ktp' => $user->foto_ktp,
                'foto_swafoto' => $user->foto_swafoto,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    // Refresh Token
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token gagal'
            ], 401);
        }
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:100',
            'no_telp' => 'sometimes|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('nama')) {
            $user->nama = $request->nama;
        }
        if ($request->has('no_telp')) {
            $user->no_telp = $request->no_telp;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diupdate',
            'user' => $user
        ]);
    }

    // Upload KTP (for verification)
    public function uploadKTP(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'foto_ktp' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'foto_swafoto' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto_ktp')) {
            $ktpPath = $request->file('foto_ktp')->store('ktp', 'public');
            $user->foto_ktp = $ktpPath;
        }

        if ($request->hasFile('foto_swafoto')) {
            $swafotoPath = $request->file('foto_swafoto')->store('swafoto', 'public');
            $user->foto_swafoto = $swafotoPath;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Dokumen KTP berhasil diupload, menunggu verifikasi',
            'foto_ktp' => $user->foto_ktp,
            'foto_swafoto' => $user->foto_swafoto,
        ]);
    }
}
