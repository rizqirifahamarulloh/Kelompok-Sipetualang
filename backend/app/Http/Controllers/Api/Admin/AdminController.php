<?php

namespace App\Http\Controllers\Api;

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
                'total_pemilik' => Pengguna::where('peran_pengguna', 'pemilik')->count(),
                'total_penyewa' => Pengguna::where('peran_pengguna', 'penyewa')->count(),
                'verified_ktp' => Pengguna::where('verifikasi_ktp', true)->count(),
                'unverified_ktp' => Pengguna::where('verifikasi_ktp', false)->count(),
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
    public function getAllUsers()
    {
        try {
            $admin = auth()->user();

            if ($admin->peran_pengguna !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses hanya untuk admin'
                ], 403);
            }

            $users = Pengguna::select([
                'id_pengguna',
                'nama',
                'email',
                'no_telp',
                'peran_pengguna',
                'verifikasi_ktp',
                'created_at'
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
     * Verify KTP
     */
    public function verifyKTP(Request $request)
    {
        try {
            $admin = auth()->user();

            if ($admin->peran_pengguna !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses hanya untuk admin'
                ], 403);
            }

            $pengguna = Pengguna::findOrFail($request->id_pengguna);
            $pengguna->verifikasi_ktp = $request->verifikasi_ktp;
            $pengguna->save();

            return response()->json([
                'success' => true,
                'message' => 'Verifikasi KTP berhasil diupdate',
                'user' => $pengguna
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Pending KTP Verification
     */
    public function getPendingKTP()
    {
        try {
            $admin = auth()->user();

            if ($admin->peran_pengguna !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses hanya untuk admin'
                ], 403);
            }

            $pendingKTP = Pengguna::where('verifikasi_ktp', false)
                ->whereNotNull('foto_ktp')
                ->select([
                    'id_pengguna',
                    'nama',
                    'email',
                    'no_telp',
                    'peran_pengguna',
                    'foto_ktp',
                    'foto_swafoto',
                    'created_at'
                ])
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $pendingKTP
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
