<?php

namespace App\Services;

use App\Models\Voucher;
use App\Models\VoucherUsage;
use Carbon\Carbon;

class VoucherService
{
    /**
     * Get available vouchers for a given subtotal (SEWA ONLY, excluding deposit)
     */
    public function getAvailableVouchers($subtotalSewa, $userId)
    {
        $vouchers = Voucher::where('is_active', true)
            ->where('tanggal_mulai', '<=', Carbon::now())
            ->where('tanggal_selesai', '>=', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->get();

        $availableVouchers = [];

        foreach ($vouchers as $voucher) {
            // Check quota
            if ($voucher->kuota > 0 && $voucher->used_count >= $voucher->kuota) {
                continue;
            }

            // Check if user already used this voucher
            if ($voucher->isUsedBy($userId)) {
                continue;
            }

            // ✅ PERBAIKAN: Check minimum purchase based on SUBTOTAL SEWA (excluding deposit)
            if ($voucher->min_pembelian > 0 && $subtotalSewa < $voucher->min_pembelian) {
                continue;
            }

            // Check maximum discount (if any)
            $discount = $this->calculateDiscount($voucher, $subtotalSewa);
            if ($discount <= 0) {
                continue;
            }

            $availableVouchers[] = $voucher;
        }

        return $availableVouchers;
    }

    /**
     * Apply voucher and calculate discount based on SUBTOTAL SEWA only
     */
    public function applyVoucher($voucherCode, $subtotalSewa, $userId)
    {
        // Find voucher
        $voucher = Voucher::where('kode_voucher', $voucherCode)
            ->where('is_active', true)
            ->where('tanggal_mulai', '<=', Carbon::now())
            ->where('tanggal_selesai', '>=', Carbon::now())
            ->first();

        if (!$voucher) {
            return [
                'valid' => false,
                'message' => 'Voucher tidak ditemukan atau sudah kadaluarsa'
            ];
        }

        // Check quota
        if ($voucher->kuota > 0 && $voucher->used_count >= $voucher->kuota) {
            return [
                'valid' => false,
                'message' => 'Kuota voucher sudah habis'
            ];
        }

        // Check if user already used
        if ($voucher->isUsedBy($userId)) {
            return [
                'valid' => false,
                'message' => 'Anda sudah menggunakan voucher ini'
            ];
        }

        // ✅ PERBAIKAN: Check minimum purchase based on SUBTOTAL SEWA
        if ($voucher->min_pembelian > 0 && $subtotalSewa < $voucher->min_pembelian) {
            return [
                'valid' => false,
                'message' => sprintf('Minimal belanja Rp %s untuk menggunakan voucher ini', number_format($voucher->min_pembelian, 0, ',', '.'))
            ];
        }

        // ✅ PERBAIKAN: Calculate discount based on SUBTOTAL SEWA only
        $discount = $this->calculateDiscount($voucher, $subtotalSewa);
        $finalPrice = max(0, $subtotalSewa - $discount);

        // Return voucher info without marking as used yet (used after payment success)
        return [
            'valid' => true,
            'message' => 'Voucher valid',
            'voucher' => $voucher,
            'original_price' => $subtotalSewa,
            'discount' => $discount,
            'final_price' => $finalPrice,
            'discount_info' => [
                'type' => $voucher->tipe_diskon,
                'value' => $voucher->nilai_diskon,
                'max_discount' => $voucher->max_diskon
            ]
        ];
    }

    /**
     * Calculate discount based on subtotal sewa
     */
    protected function calculateDiscount($voucher, $subtotalSewa)
    {
        if ($voucher->tipe_diskon === 'percentage') {
            $discount = $subtotalSewa * ($voucher->nilai_diskon / 100);
            if ($voucher->max_diskon && $discount > $voucher->max_diskon) {
                $discount = $voucher->max_diskon;
            }
            return $discount;
        } else {
            // Nominal discount
            return min($voucher->nilai_diskon, $subtotalSewa);
        }
    }

/**
 * Mark voucher as used after successful payment
 */
public function markVoucherAsUsed($voucherId, $userId, $transactionId, $discountAmount, $totalSetelahDiskon = null)
{
    $data = [
        'id_voucher' => $voucherId,
        'id_pengguna' => $userId,
        'id_transaksi' => $transactionId,
        'diskon_dapat' => $discountAmount,
        'total_setelah_diskon' => $totalSetelahDiskon,
        'used_at' => Carbon::now(),
    ];

    // Jika kolom total_setelah_diskon ada di tabel, tambahkan
    if ($totalSetelahDiskon !== null) {
        $data['total_setelah_diskon'] = $totalSetelahDiskon;
    }

    VoucherUsage::create($data);

    Voucher::where('id', $voucherId)->increment('used_count');
}
}
