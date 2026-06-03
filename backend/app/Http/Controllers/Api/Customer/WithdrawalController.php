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

        // Hitung total saldo yang sedang pending (belum diproses admin)
        $pendingAmount = Withdrawal::where('user_id', $user->id_pengguna)
            ->where('status', 'pending')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'total_earned' => $user->total_earned,
                'total_withdrawn' => $user->total_withdrawn,
                'pending_withdrawal' => $pendingAmount,
            ]
        ]);
    }

    /**
     * Request withdrawal — STATUS PENDING, MENUNGGU APPROVAL ADMIN
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

        // Hitung saldo yang sedang pending
        $pendingAmount = Withdrawal::where('user_id', $user->id_pengguna)
            ->where('status', 'pending')
            ->sum('amount');

        // Check if balance minus pending is sufficient
        $availableBalance = $user->balance - $pendingAmount;
        if ($availableBalance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi. Saldo tersedia: Rp ' . number_format($availableBalance, 0, ',', '.') . ' (setelah dikurangi penarikan dalam proses)'
            ], 400);
        }

        try {
            // Catat penarikan dengan status PENDING (menunggu admin)
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id_pengguna,
                'amount' => $amount,
                'bank_name' => $request->bank_name,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan penarikan berhasil! Menunggu persetujuan admin.',
                'data' => $withdrawal
            ]);

        } catch (\Exception $e) {
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
