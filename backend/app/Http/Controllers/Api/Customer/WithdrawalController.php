<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * Get balance info for current user
     */
    public function getBalance()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'total_earned' => $user->total_earned,
                'total_withdrawn' => $user->total_withdrawn,
            ]
        ]);
    }

    /**
     * Instant withdrawal - LANGSUNG CAIR, TANPA KONFIRMASI
     */
    public function requestWithdrawal(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'amount' => 'required|numeric|min:50000',
            'bank_name' => 'required|string',
            'bank_account_number' => 'required|string',
            'bank_account_name' => 'required|string',
        ]);

        $amount = $request->amount;

        // Check minimum withdrawal
        if ($amount < 50000) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal penarikan adalah Rp 50.000'
            ], 400);
        }

        // Check if balance is sufficient
        if ($user->balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Kurangi saldo user
            $user->decrement('balance', $amount);

            // Update total withdrawn
            $user->increment('total_withdrawn', $amount);

            // Catat penarikan dengan status COMPLETED (LANGSUNG CAIR)
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id_pengguna,
                'amount' => $amount,
                'bank_name' => $request->bank_name,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'status' => 'completed', // ✅ LANGSUNG COMPLETED!
                'processed_at' => now(),
                'admin_note' => 'Penarikan otomatis cair'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Penarikan berhasil! Dana akan segera ditransfer ke rekening Anda.',
                'data' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan penarikan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get withdrawal history for current user
     */
    public function withdrawalHistory()
    {
        $withdrawals = Withdrawal::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $withdrawals
        ]);
    }
}
