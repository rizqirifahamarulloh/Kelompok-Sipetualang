<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Barang;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    // POV Customer: Sewa Barang
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'items' => 'required|array',
            'items.*.id_barang' => 'required|exists:barang,id_barang',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $totalBiaya = 0;
        $nominalDeposit = 50000; // Contoh deposit flat atau bisa dihitung dinamis

        return DB::transaction(function () use ($request, $user, $nominalDeposit) {
            $transaksi = Transaksi::create([
                'id_penyewa' => $user->id_pengguna,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'total_biaya' => 0, // Akan diupdate setelah hitung subtotal
                'nominal_deposit' => $nominalDeposit,
                'status_sewa' => 'menunggu_pembayaran',
            ]);

            $total = 0;
            foreach ($request->items as $item) {
                $barang = Barang::findOrFail($item['id_barang']);
                
                // Cek stok (sangat basic)
                if ($barang->jumlah_stok < $item['jumlah']) {
                    throw new \Exception("Stok barang {$barang->nama_barang} tidak mencukupi");
                }

                $subtotal = $barang->harga_sewa * $item['jumlah'];
                $total += $subtotal;

                DetailTransaksi::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_barang' => $barang->id_barang,
                    'jumlah_pinjam' => $item['jumlah'],
                    'subtotal' => $subtotal,
                ]);

                // Kurangi stok
                $barang->decrement('jumlah_stok', $item['jumlah']);
            }

            $transaksi->update(['total_biaya' => $total]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaksi->load('penyewa')
            ], 201);
        });
    }

    // Lihat riwayat sewa saya
    public function myHistory()
    {
        $user = Auth::user();
        $history = Transaksi::where('id_penyewa', $user->id_pengguna)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
