<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Transaksi;
use App\Models\Pengembalian;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    protected $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
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
            'id_barang' => 'required|exists:barang,id_barang',
            'jumlah' => 'required|integer|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'metode_pengiriman' => 'required|in:pickup,delivery',
            'alamat_pengiriman' => 'nullable|string',
            'biaya_pengiriman' => 'nullable|numeric',
        ]);

        DB::beginTransaction();

        try {
            $barang = Barang::with('pemilik')->findOrFail($request->id_barang);

            // Hitung total hari
            $start = \Carbon\Carbon::parse($request->tanggal_mulai);
            $end = \Carbon\Carbon::parse($request->tanggal_selesai);
            $totalHari = $start->diffInDays($end) + 1;

            // Hitung total biaya sewa
            $totalSewa = $barang->harga_sewa * $totalHari * $request->jumlah;
            $biayaPengiriman = $request->biaya_pengiriman ?? 0;

            // Ambil nominal deposit dari barang (per unit, dikalikan jumlah)
            $nominalDeposit = ($barang->nominal_deposit ?? 0) * $request->jumlah;

            // Total biaya = sewa + pengiriman + deposit
            $totalBiaya = $totalSewa + $biayaPengiriman + $nominalDeposit;

            // Hitung fee admin (20%) dan pendapatan pemilik (80%) — hanya dari biaya sewa
            $feeAdmin = $totalSewa * 0.2;
            $pendapatanPemilik = $totalSewa - $feeAdmin;

            // Buat order ID
            $orderId = 'TRX-' . time() . '-' . Auth::id() . '-' . $barang->id_barang;

            // Simpan transaksi
            $transaksi = Transaksi::create([
                'id_penyewa' => Auth::id(),
                'id_pemilik' => $barang->id_pemilik,
                'id_barang' => $barang->id_barang,
                'nama_barang' => $barang->nama_barang,
                'jumlah' => $request->jumlah,
                'harga_per_hari' => $barang->harga_sewa,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'total_hari' => $totalHari,
                'total_biaya' => $totalBiaya,
                'nominal_deposit' => $nominalDeposit,
                'fee_admin' => $feeAdmin,
                'pendapatan_pemilik' => $pendapatanPemilik,
                'metode_pengiriman' => $request->metode_pengiriman,
                'alamat_pengiriman' => $request->alamat_pengiriman,
                'biaya_pengiriman' => $biayaPengiriman,
                'status_pembayaran' => 'pending',
                'status_sewa' => 'menunggu_pembayaran',
                'midtrans_order_id' => $orderId,
            ]);

            // Prepare items untuk Midtrans
            $items = [
                [
                    'id' => (string) $barang->id_barang,
                    'price' => (int) $barang->harga_sewa,
                    'quantity' => $totalHari * $request->jumlah,
                    'name' => $barang->nama_barang . ' (' . $totalHari . ' hari x ' . $request->jumlah . ')',
                ],
                [
                    'id' => 'ADMIN_FEE',
                    'price' => (int) $feeAdmin,
                    'quantity' => 1,
                    'name' => 'Biaya Layanan SiPetualang (20%)',
                ],
            ];

            // Tambahkan item deposit jika ada
            if ($nominalDeposit > 0) {
                $items[] = [
                    'id' => 'DEPOSIT',
                    'price' => (int) $nominalDeposit,
                    'quantity' => 1,
                    'name' => 'Deposit Keamanan (Refundable)',
                ];
            }

            if ($biayaPengiriman > 0) {
                $items[] = [
                    'id' => 'SHIPPING_COST',
                    'price' => (int) $biayaPengiriman,
                    'quantity' => 1,
                    'name' => 'Biaya Pengiriman',
                ];
            }

            // Customer details
            $user = Auth::user();
            $customerDetails = [
                'first_name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->no_telp ?? '',
            ];

            // Create Midtrans transaction
            $result = $this->midtrans->createTransaction($orderId, (int) $totalBiaya, $items, $customerDetails);

            if (isset($result['error'])) {
                DB::rollBack();
                return response()->json(['error' => $result['error']], 500);
            }

            $transaksi->update(['snap_token' => $result['snap_token']]);

            DB::commit();

            return response()->json([
                'snap_token' => $result['snap_token'],
                'transaction_id' => $transaksi->id_transaksi,
                'order_id' => $orderId,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTransaksiSebagaiPenyewa()
    {
        $transaksi = Transaksi::with(['pemilik', 'barang', 'pengembalian'])
            ->where('id_penyewa', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transaksi
        ]);
    }

    public function getTransaksiSebagaiPemilik()
    {
        $transaksi = Transaksi::with(['penyewa', 'barang', 'pengembalian'])
            ->where('id_pemilik', Auth::id())
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
            ->where(function($q) {
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
            // Hanya anggap terlambat jika tanggal kembali melebihi tanggal selesai sewa (beda hari)
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

            // Kurangi stok barang
            $barang = Barang::find($transaksi->id_barang);
            if ($barang) {
                $barang->decrement('jumlah_stok', $transaksi->jumlah);
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
