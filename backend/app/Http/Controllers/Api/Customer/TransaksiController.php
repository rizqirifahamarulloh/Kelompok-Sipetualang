<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\DetailTransaksi;
use App\Models\Transaksi;
use App\Models\Pengembalian;
use App\Models\Pengguna;
use App\Services\MidtransService;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    protected $midtrans;
    protected $voucherService;

    public function __construct(MidtransService $midtrans, VoucherService $voucherService)
    {
        $this->midtrans = $midtrans;
        $this->voucherService = $voucherService;
    }

    public function checkout(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda harus melakukan verifikasi KTP dan disetujui oleh admin terlebih dahulu untuk menyewa barang.'
            ], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id_barang' => 'required|exists:barang,id_barang',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.tanggal_mulai' => 'required|date',
            'items.*.tanggal_selesai' => 'required|date|after:items.*.tanggal_mulai',
            'metode_pengiriman' => 'required|in:pickup,delivery',
            'alamat_pengiriman' => 'nullable|string',
            'biaya_pengiriman' => 'nullable|numeric',
            'kode_voucher' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $items = $request->items;
            $biayaPengiriman = $request->biaya_pengiriman ?? 0;
            $voucherCode = $request->kode_voucher;

            // Calculate totals for all items
            $totalSewa = 0;
            $totalDeposit = 0;
            $midtransItems = [];
            $detailItems = [];

            // Use the first item's dates for the master transaction
            $firstItem = $items[0];
            $masterStart = \Carbon\Carbon::parse($firstItem['tanggal_mulai']);
            $masterEnd = \Carbon\Carbon::parse($firstItem['tanggal_selesai']);
            $masterTotalHari = $masterStart->diffInDays($masterEnd) + 1;

            foreach ($items as $item) {
                $barang = Barang::with('pemilik')->findOrFail($item['id_barang']);

                // Check stock
                if ($barang->jumlah_stok < $item['jumlah']) {
                    DB::rollBack();
                    return response()->json([
                        'status' => 'error',
                        'message' => "Stok '{$barang->nama_barang}' tidak mencukupi (tersisa {$barang->jumlah_stok} unit)"
                    ], 400);
                }

                $start = \Carbon\Carbon::parse($item['tanggal_mulai']);
                $end = \Carbon\Carbon::parse($item['tanggal_selesai']);
                $totalHari = $start->diffInDays($end) + 1;

                // Check minimum rental duration
                $minDurasi = $barang->min_durasi_sewa ?? 1;
                if ($totalHari < $minDurasi) {
                    DB::rollBack();
                    return response()->json([
                        'status' => 'error',
                        'message' => "Durasi sewa '{$barang->nama_barang}' minimal {$minDurasi} hari (Anda memilih {$totalHari} hari)"
                    ], 400);
                }

                $subtotalSewa = $barang->harga_sewa * $totalHari * $item['jumlah'];
                $itemDeposit = ($barang->nominal_deposit ?? 0) * $item['jumlah'];

                $totalSewa += $subtotalSewa;
                $totalDeposit += $itemDeposit;

                $detailItems[] = [
                    'id_barang' => $barang->id_barang,
                    'nama_barang' => $barang->nama_barang,
                    'harga_per_hari' => $barang->harga_sewa,
                    'jumlah_pinjam' => $item['jumlah'],
                    'subtotal' => $subtotalSewa,
                    'nominal_deposit' => $itemDeposit,
                    'id_pemilik' => $barang->id_pemilik,
                    'total_hari' => $totalHari,
                ];
            }

            // Proses voucher (diskon hanya untuk totalSewa, TANPA deposit)
            $voucherDiscount = 0;
            $appliedVoucherData = null;
            $finalTotalSewa = $totalSewa;

            if ($voucherCode) {
                $result = $this->voucherService->applyVoucher($voucherCode, $totalSewa, Auth::id());

                if ($result['valid']) {
                    $voucherDiscount = $result['discount'];
                    $appliedVoucherData = $result['voucher'];
                    $finalTotalSewa = $result['final_price'];
                } else {
                    // Jika voucher tidak valid, tetap lanjutkan tapi beri warning
                    // Atau bisa juga return error jika ingin memaksa voucher valid
                }
            }

            //  Hitung ulang total biaya: (SEWA setelah diskon) + DEPOSIT + ONGKIR
            $totalBiaya = $finalTotalSewa + $totalDeposit + $biayaPengiriman;

            //  Buat Midtrans items berdasarkan harga setelah diskon
            // Ini lebih kompleks karena diskon harus dialokasikan ke item sewa (bukan deposit)
            // Cara sederhana: buat item diskon negatif di Midtrans

            $midtransItems = [];

            // Add rental items with original prices
            foreach ($detailItems as $detail) {
                $midtransItems[] = [
                    'id' => (string) $detail['id_barang'],
                    'price' => (int) $detail['harga_per_hari'],
                    'quantity' => $detail['total_hari'] * $detail['jumlah_pinjam'],
                    'name' => mb_substr($detail['nama_barang'], 0, 40) . ' (' . $detail['total_hari'] . 'hr x' . $detail['jumlah_pinjam'] . ')',
                ];
            }

            // Add deposit items (NOT discounted)
            foreach ($detailItems as $detail) {
                if ($detail['nominal_deposit'] > 0) {
                    $midtransItems[] = [
                        'id' => 'DEP-' . $detail['id_barang'],
                        'price' => (int) ($detail['nominal_deposit'] / $detail['jumlah_pinjam']), // price per unit
                        'quantity' => $detail['jumlah_pinjam'],
                        'name' => 'Deposit: ' . mb_substr($detail['nama_barang'], 0, 30),
                    ];
                }
            }

            //  Add discount as negative item (only if discount > 0)
            if ($voucherDiscount > 0) {
                $midtransItems[] = [
                    'id' => 'DISCOUNT',
                    'price' => - (int) $voucherDiscount,
                    'quantity' => 1,
                    'name' => 'Diskon Voucher: ' . ($voucherCode ?? ''),
                ];
            }

            // Add shipping cost if applicable
            if ($biayaPengiriman > 0) {
                $midtransItems[] = [
                    'id' => 'SHIPPING',
                    'price' => (int) $biayaPengiriman,
                    'quantity' => 1,
                    'name' => 'Biaya Pengiriman',
                ];
            }

            // Calculate gross_amount from Midtrans items
            $grossAmount = 0;
            foreach ($midtransItems as $mi) {
                $grossAmount += $mi['price'] * $mi['quantity'];
            }

            // Fee admin (20% dari total SEWA ASLI sebelum diskon)
            $feeAdmin = round($totalSewa * 0.2) + $biayaPengiriman;
            $pendapatanPemilik = $totalSewa - round($totalSewa * 0.2);

            // Build order ID
            $orderId = 'TRX-' . time() . '-' . Auth::id();

            // Use first item as the primary reference (backward compat)
            $firstBarang = Barang::findOrFail($items[0]['id_barang']);

            // Create master transaction
            $transaksi = Transaksi::create([
                'id_penyewa' => Auth::id(),
                'id_pemilik' => $firstBarang->id_pemilik,
                'id_barang' => $firstBarang->id_barang,
                'nama_barang' => count($items) > 1
                    ? $firstBarang->nama_barang . ' +' . (count($items) - 1) . ' lainnya'
                    : $firstBarang->nama_barang,
                'jumlah' => array_sum(array_column($items, 'jumlah')),
                'harga_per_hari' => $firstBarang->harga_sewa,
                'tanggal_mulai' => $firstItem['tanggal_mulai'],
                'tanggal_selesai' => $firstItem['tanggal_selesai'],
                'total_hari' => $masterTotalHari,
                'total_biaya' => $totalBiaya,
                'nominal_deposit' => $totalDeposit,
                'fee_admin' => $feeAdmin,
                'pendapatan_pemilik' => $pendapatanPemilik,
                'metode_pengiriman' => $request->metode_pengiriman,
                'alamat_pengiriman' => $request->alamat_pengiriman,
                'biaya_pengiriman' => $biayaPengiriman,
                'status_pembayaran' => 'pending',
                'status_sewa' => 'menunggu_pembayaran',
                'midtrans_order_id' => $orderId,
                'kode_voucher' => $voucherCode,  //  Simpan kode voucher
                'diskon_voucher' => $voucherDiscount,  //  Simpan nominal diskon
            ]);

            // Create detail transaksi for each item
            foreach ($detailItems as $detail) {
                DetailTransaksi::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_barang' => $detail['id_barang'],
                    'nama_barang' => $detail['nama_barang'],
                    'harga_per_hari' => $detail['harga_per_hari'],
                    'jumlah_pinjam' => $detail['jumlah_pinjam'],
                    'subtotal' => $detail['subtotal'],
                    'nominal_deposit' => $detail['nominal_deposit'],
                    'id_pemilik' => $detail['id_pemilik'],
                ]);
            }

            // Customer details for Midtrans
            $customerDetails = [
                'first_name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->no_telp ?? '',
            ];

            // Create Midtrans transaction
            $result = $this->midtrans->createTransaction(
                $orderId,
                $grossAmount,
                $midtransItems,
                $customerDetails,
                [
                    'finish' => 'https://petualang-sibm4.karyakreasi.id/customer/transactions',
                    'error' => 'https://petualang-sibm4.karyakreasi.id/customer/transactions',
                    'pending' => 'https://petualang-sibm4.karyakreasi.id/customer/transactions',
                ]
            );

            if (isset($result['error'])) {
                DB::rollBack();
                return response()->json(['error' => $result['error']], 500);
            }

if ($voucherDiscount > 0 && $appliedVoucherData) {
    $this->voucherService->markVoucherAsUsed(
        $appliedVoucherData->id,
        Auth::id(),
        $transaksi->id_transaksi,
        $voucherDiscount,
        $finalTotalSewa
    );
}

            $transaksi->update(['snap_token' => $result['snap_token']]);

            DB::commit();

            return response()->json([
                'snap_token' => $result['snap_token'],
                'transaction_id' => $transaksi->id_transaksi,
                'order_id' => $orderId,
                'total_items' => count($items),
                'discount_applied' => $voucherDiscount,
                'final_total' => $totalBiaya,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get transactions where current user is the renter (penyewa)
     */
    public function getTransaksiSebagaiPenyewa()
    {
        $transaksi = Transaksi::with(['pemilik', 'barang', 'pengembalian', 'detailTransaksi.barang.pemilik'])
            ->where('id_penyewa', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transaksi
        ]);
    }

    /**
     * Get transactions where current user is the owner (pemilik).
     * For multi-item transactions, show transactions that contain items owned by the current user.
     */
    public function getTransaksiSebagaiPemilik()
    {
        // Find all transaksi IDs that have detail items owned by this user
        $transaksiIdsFromDetail = DetailTransaksi::where('id_pemilik', Auth::id())
            ->pluck('id_transaksi')
            ->unique()
            ->toArray();

        // Also find directly from transaksi table (backward compatibility)
        $transaksiIdsDirect = Transaksi::where('id_pemilik', Auth::id())
            ->pluck('id_transaksi')
            ->toArray();

        $allIds = array_unique(array_merge($transaksiIdsFromDetail, $transaksiIdsDirect));

        $transaksi = Transaksi::with(['penyewa', 'barang', 'pengembalian', 'detailTransaksi.barang.pemilik'])
            ->whereIn('id_transaksi', $allIds)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transaksi
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status_sewa' => 'required|in:menunggu_pembayaran,dibayar,sedang_disewa,selesai,dibatalkan',
        ]);

        $transaksi = Transaksi::where('id_transaksi', $id)
            ->where(function ($q) {
                $q->where('id_penyewa', Auth::id())
                    ->orWhere('id_pemilik', Auth::id());
            })
            ->first();

        if (!$transaksi) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        $transaksi->update(['status_sewa' => $request->status_sewa]);

        if ($request->status_sewa === 'selesai') {
            $tanggalKembali = now();
            $tanggalSelesaiSewa = \Carbon\Carbon::parse($transaksi->tanggal_selesai);

            $hariKeterlambatan = 0;
            if ($tanggalKembali->startOfDay()->greaterThan($tanggalSelesaiSewa->startOfDay())) {
                $hariKeterlambatan = $tanggalKembali->startOfDay()->diffInDays($tanggalSelesaiSewa->startOfDay());
            }

            $dendaPerHari = 20000;
            $totalDenda = $hariKeterlambatan * $dendaPerHari;

            Pengembalian::updateOrCreate(
                ['id_transaksi' => $transaksi->id_transaksi],
                [
                    'tanggal_kembali' => $tanggalKembali->format('Y-m-d'),
                    'jumlah_kembali' => $transaksi->jumlah,
                    'denda_per_hari' => $dendaPerHari,
                    'total_denda' => $totalDenda,
                    'status_pengembalian' => $hariKeterlambatan > 0 ? 'terlambat' : 'tepat_waktu',
                    'kondisi_barang' => 'baik',
                ]
            );

            $transaksi->update(['tanggal_kembali_real' => $tanggalKembali->format('Y-m-d')]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
            'data' => $transaksi->load('pengembalian')
        ]);
    }

/**
 * Handle Midtrans payment notification.
 * For multi-item transactions, decrement stock for ALL items in detail_transaksi.
 * Also add balance to owner (perental) and admin.
 */
public function handleNotification(Request $request)
{
    $result = $this->midtrans->handleNotification();

    $transaksi = Transaksi::where('midtrans_order_id', $result['order_id'])->first();

    if (!$transaksi) {
        return response()->json(['error' => 'Transaction not found'], 404);
    }

    if ($result['status'] === 'capture' || $result['status'] === 'settlement') {
        $transaksi->update([
            'status_pembayaran' => 'sukses',
            'status_sewa' => 'dibayar',
        ]);

        // ========== ESCROW: ADMIN MENAMPUNG SELURUH UANG ==========
        // Pendapatan pemilik DITAHAN admin sampai barang dikembalikan & dikonfirmasi
        // Perental TIDAK menerima saldo di sini — akan di-release saat adminKonfirmasiKembali
        $admin = \App\Models\Pengguna::where('peran_pengguna', 'admin')->first();
        if ($admin) {
            // Admin menampung fee_admin + pendapatan_pemilik (total sewa)
            $admin->increment('balance', $transaksi->fee_admin + $transaksi->pendapatan_pemilik);
            $admin->increment('total_earned', $transaksi->fee_admin);
        }

        // Decrement stock for ALL items in this transaction
        $details = DetailTransaksi::where('id_transaksi', $transaksi->id_transaksi)->get();

        if ($details->isNotEmpty()) {
            // Multi-item: use detail_transaksi
            foreach ($details as $detail) {
                $barang = Barang::find($detail->id_barang);
                if ($barang) {
                    $barang->decrement('jumlah_stok', $detail->jumlah_pinjam);
                }
            }
        } else {
            // Backward compatibility: single-item from transaksi table
            $barang = Barang::find($transaksi->id_barang);
            if ($barang) {
                $barang->decrement('jumlah_stok', $transaksi->jumlah);
            }
        }
    } elseif ($result['status'] === 'deny' || $result['status'] === 'expire' || $result['status'] === 'cancel') {
        $transaksi->update([
            'status_pembayaran' => 'gagal',
            'status_sewa' => 'dibatalkan',
        ]);
    }

    return response()->json(['status' => 'ok']);
}
}
