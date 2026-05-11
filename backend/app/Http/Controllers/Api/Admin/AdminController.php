<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Admin Dashboard
     */
    public function dashboard()
    {
        try {
            $admin = auth()->user();

            // Pastikan user adalah admin
            if ($admin->peran_pengguna !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses hanya untuk admin'
                ], 403);
            }

            $stats = [
                'total_users' => Pengguna::count(),
                'total_customers' => Pengguna::where('peran_pengguna', 'customer')->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Dashboard admin',
                'admin' => [
                    'id_pengguna' => $admin->id_pengguna,
                    'nama' => $admin->nama,
                    'email' => $admin->email,
                ],
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get All Users
     */
    public function index()
    {
        try {
            $users = Pengguna::select([
                'id_pengguna',
                'nama',
                'email',
                'alamat',
                'kota',
                'no_telp',
                'peran_pengguna',
            ])->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a New User
     */
    public function store(Request $request)
    {
        try {
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'nama' => 'required|string|max:100',
                'email' => 'required|string|email|max:100|unique:pengguna,email',
                'password' => 'required|string|min:6',
                'alamat' => 'nullable|string',
                'kota' => 'nullable|string|max:100',
                'no_telp' => 'nullable|string|max:15',
                'peran_pengguna' => 'required|in:customer,admin',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Pengguna::create([
                'nama' => $request->nama,
                'email' => $request->email,
                'password' => \Illuminate\Support\Facades\Hash::make($request->password),
                'alamat' => $request->alamat,
                'kota' => $request->kota,
                'no_telp' => $request->no_telp,
                'peran_pengguna' => $request->peran_pengguna,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get User Details
     */
    public function show($id)
    {
        try {
            $user = Pengguna::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update User
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Pengguna::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'nama' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|string|email|max:100|unique:pengguna,email,' . $id . ',id_pengguna',
                'password' => 'nullable|string|min:6',
                'alamat' => 'nullable|string',
                'kota' => 'nullable|string|max:100',
                'no_telp' => 'nullable|string|max:15',
                'peran_pengguna' => 'sometimes|required|in:customer,admin',
                'rental' => 'sometimes|required|in:true,false',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->has('nama')) $user->nama = $request->nama;
            if ($request->has('email')) $user->email = $request->email;
            if ($request->has('password') && !empty($request->password)) {
                $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            }
            if ($request->has('alamat')) $user->alamat = $request->alamat;
            if ($request->has('kota')) $user->kota = $request->kota;
            if ($request->has('no_telp')) $user->no_telp = $request->no_telp;
            if ($request->has('peran_pengguna')) $user->peran_pengguna = $request->peran_pengguna;
            if ($request->has('rental')) $user->rental = $request->rental;

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete User
     */
    public function destroy($id)
    {
        try {
            $user = Pengguna::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset User Password to default
     */
    public function resetPassword($id)
    {
        try {
            $user = Pengguna::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $user->password = \Illuminate\Support\Facades\Hash::make('password');
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully to default'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
