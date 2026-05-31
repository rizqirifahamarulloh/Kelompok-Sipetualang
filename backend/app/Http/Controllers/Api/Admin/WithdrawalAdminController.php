<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        $withdrawals = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $withdrawals
        ]);
    }

    /**
     * Admin instant withdrawal - LANGSUNG CAIR
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
        $stats = [
            'completed_total' => Withdrawal::where('status', 'completed')->sum('amount'),
            'completed_count' => Withdrawal::where('status', 'completed')->count(),
            'rejected_total' => Withdrawal::where('status', 'rejected')->sum('amount'),
            'rejected_count' => Withdrawal::where('status', 'rejected')->count(),
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
