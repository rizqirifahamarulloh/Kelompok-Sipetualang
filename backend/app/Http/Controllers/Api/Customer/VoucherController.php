<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    protected $voucherService;

    public function __construct(VoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    /**
     * Get available vouchers for checkout
     */
    public function getAvailableVouchers(Request $request)
    {
        $request->validate([
            'total_price' => 'required|numeric|min:0'
        ]);

        $userId = auth()->id();
        $totalPrice = $request->total_price;

        $vouchers = $this->voucherService->getAvailableVouchers($totalPrice, $userId);

        return response()->json([
            'status' => 'success',
            'data' => $vouchers
        ]);
    }

    /**
     * Validate and apply voucher code
     */
    public function validateAndApply(Request $request)
    {
        $request->validate([
            'kode_voucher' => 'required|string',
            'total_price' => 'required|numeric|min:0'
        ]);

        $userId = auth()->id();
        $voucherCode = $request->kode_voucher;
        $totalPrice = $request->total_price;

        $result = $this->voucherService->applyVoucher($voucherCode, $totalPrice, $userId);

        if (!$result['valid']) {
            return response()->json([
                'status' => 'error',
                'message' => $result['message']
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil digunakan',
            'data' => [
                'voucher' => $result['voucher'],
                'original_price' => $result['original_price'],
                'discount' => $result['discount'],
                'final_price' => $result['final_price'],
                'discount_info' => $result['discount_info']
            ]
        ]);
    }

    /**
     * Get all available vouchers (without checkout context)
     */
    public function getAllAvailable()
    {
        $userId = auth()->id();

        $vouchers = Voucher::where('is_active', true)
            ->where('tanggal_mulai', '<=', now())
            ->where('tanggal_selesai', '>=', now())
            ->orderBy('created_at', 'desc')
            ->get();

        $vouchers = $vouchers->filter(function ($voucher) use ($userId) {
            if ($voucher->kuota > 0 && $voucher->used_count >= $voucher->kuota) {
                return false;
            }
            if ($voucher->isUsedBy($userId)) {
                return false;
            }
            return true;
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $vouchers
        ]);
    }
}
