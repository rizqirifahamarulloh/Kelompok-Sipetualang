<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WithdrawalAdminController extends Controller
{
    /**
     * Get all withdrawals (riwayat semua penarikan)
     */
    public function getAllWithdrawals(Request $request)
    {
        $query = Withdrawal::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->orderByRaw("FIELD(status, 'pending', 'completed', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $withdrawals
        ]);
    }

    /**
     * Approve withdrawal — Admin sudah transfer manual, upload bukti
     */
    public function approveWithdrawal($id, Request $request)
    {
        $request->validate([
            'transfer_proof' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'admin_note' => 'nullable|string|max:500',
        ]);

        $withdrawal = Withdrawal::with('user')->findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Penarikan ini sudah diproses sebelumnya.'
            ], 400);
        }

        $user = $withdrawal->user;

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        // Cek saldo user masih cukup
        if ($user->balance < $withdrawal->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo user tidak mencukupi untuk penarikan ini. Saldo: Rp ' . number_format($user->balance, 0, ',', '.')
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Upload bukti transfer
            $path = $request->file('transfer_proof')->store('withdrawal-proofs', 'public');

            // Kurangi saldo user
            $user->decrement('balance', $withdrawal->amount);
            $user->increment('total_withdrawn', $withdrawal->amount);

            // Update withdrawal
            $withdrawal->update([
                'status' => 'completed',
                'transfer_proof' => $path,
                'admin_note' => $request->admin_note ?? 'Penarikan disetujui oleh admin',
                'processed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Penarikan berhasil disetujui! Bukti transfer telah disimpan.',
                'data' => $withdrawal->fresh('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal approve penarikan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject withdrawal — Admin tolak penarikan
     */
    public function rejectWithdrawal($id, Request $request)
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Penarikan ini sudah diproses sebelumnya.'
            ], 400);
        }

        try {
            $withdrawal->update([
                'status' => 'rejected',
                'admin_note' => $request->admin_note,
                'processed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Penarikan berhasil ditolak.',
                'data' => $withdrawal->fresh('user')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal reject penarikan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin instant withdrawal — LANGSUNG CAIR (untuk admin sendiri)
     */
    public function adminWithdrawal(Request $request)
    {
        $admin = Auth::user();

        $request->validate([
            'amount' => 'required|numeric|min:50000',
            'bank_name' => 'required|string',
            'bank_account_number' => 'required|string',
            'bank_account_name' => 'required|string',
        ]);

        $amount = $request->amount;

        if ($admin->balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo admin tidak mencukupi'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $admin->decrement('balance', $amount);
            $admin->increment('total_withdrawn', $amount);

            $withdrawal = Withdrawal::create([
                'user_id' => $admin->id_pengguna,
                'amount' => $amount,
                'bank_name' => $request->bank_name,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'status' => 'completed',
                'processed_at' => now(),
                'admin_note' => 'Penarikan admin'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Penarikan admin berhasil!',
                'data' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get withdrawal stats for admin dashboard
     */
    public function getStats()
    {
        // Perental (customer/perental) withdrawals
        $perentalQuery = fn($status) => Withdrawal::where('status', $status)
            ->whereHas('user', fn($q) => $q->whereIn('peran_pengguna', ['customer', 'perental']));

        // Admin withdrawals
        $adminQuery = fn($status) => Withdrawal::where('status', $status)
            ->whereHas('user', fn($q) => $q->where('peran_pengguna', 'admin'));

        $stats = [
            // Perental
            'perental_pending_total' => $perentalQuery('pending')->sum('amount'),
            'perental_pending_count' => $perentalQuery('pending')->count(),
            'perental_completed_total' => $perentalQuery('completed')->sum('amount'),
            'perental_completed_count' => $perentalQuery('completed')->count(),
            'perental_rejected_total' => $perentalQuery('rejected')->sum('amount'),
            'perental_rejected_count' => $perentalQuery('rejected')->count(),
            // Admin
            'admin_completed_total' => $adminQuery('completed')->sum('amount'),
            'admin_completed_count' => $adminQuery('completed')->count(),
            // Combined (backward compatible)
            'pending_total' => Withdrawal::where('status', 'pending')->sum('amount'),
            'pending_count' => Withdrawal::where('status', 'pending')->count(),
            'completed_total' => Withdrawal::where('status', 'completed')->sum('amount'),
            'completed_count' => Withdrawal::where('status', 'completed')->count(),
            // This month
            'this_month_total' => Withdrawal::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
            'this_month_count' => Withdrawal::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
