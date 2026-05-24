<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Transaksi;
use App\Models\Verifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $notifications = [];

        if ($user->peran_pengguna === 'customer') {
            // 1. Akun Verifikasi Status
            $verifStatus = $user->verification_status;
            if (!$verifStatus) {
                $notifications[] = [
                    'id' => 'verif_none',
                    'type' => 'verification',
                    'title' => 'Akun Belum Terverifikasi',
                    'message' => 'Akun Anda belum terverifikasi. Silakan unggah foto KTP Anda di menu verifikasi untuk mulai menyewa.',
                    'severity' => 'danger',
                    'created_at' => now()->toIso8601String(),
                ];
            } elseif ($verifStatus === 'pending') {
                $notifications[] = [
                    'id' => 'verif_pending',
                    'type' => 'verification',
                    'title' => 'Verifikasi Diproses',
                    'message' => 'Dokumen verifikasi KTP Anda sedang dalam proses peninjauan oleh Admin.',
                    'severity' => 'warning',
                    'created_at' => now()->toIso8601String(),
                ];
            } elseif ($verifStatus === 'ditolak') {
                $note = $user->verification_note ? ' Catatan: ' . $user->verification_note : '';
                $notifications[] = [
                    'id' => 'verif_rejected',
                    'type' => 'verification',
                    'title' => 'Verifikasi KTP Ditolak',
                    'message' => 'Dokumen verifikasi KTP Anda ditolak oleh Admin.' . $note . ' Silakan ajukan ulang.',
                    'severity' => 'danger',
                    'created_at' => now()->toIso8601String(),
                ];
            }

            // 2. Transaksi & Pembayaran Status
            $transaksis = Transaksi::with('pembayaran')
                ->where('id_penyewa', $user->id_pengguna)
                ->orderBy('id_transaksi', 'desc')
                ->get();

            foreach ($transaksis as $t) {
                // Status Sewa
                if ($t->status_sewa === 'menunggu_pembayaran') {
                    $notifications[] = [
                        'id' => 'sewa_wait_' . $t->id_transaksi,
                        'type' => 'transaction',
                        'title' => 'Menunggu Pembayaran',
                        'message' => "Transaksi #{$t->id_transaksi} dengan total Rp " . number_format($t->total_biaya, 0, ',', '.') . " menunggu pembayaran Anda.",
                        'severity' => 'warning',
                        'created_at' => now()->toIso8601String(),
                    ];
                } elseif ($t->status_sewa === 'dibayar') {
                    $notifications[] = [
                        'id' => 'sewa_paid_' . $t->id_transaksi,
                        'type' => 'transaction',
                        'title' => 'Pembayaran Berhasil',
                        'message' => "Pembayaran transaksi #{$t->id_transaksi} telah dikonfirmasi. Peralatan siap diambil.",
                        'severity' => 'success',
                        'created_at' => now()->toIso8601String(),
                    ];
                } elseif ($t->status_sewa === 'sedang_disewa') {
                    $notifications[] = [
                        'id' => 'sewa_rent_' . $t->id_transaksi,
                        'type' => 'transaction',
                        'title' => 'Peralatan Sedang Disewa',
                        'message' => "Anda sedang menyewa peralatan dari Transaksi #{$t->id_transaksi}. Tanggal kembali: " . date('d-m-Y', strtotime($t->tanggal_selesai)),
                        'severity' => 'info',
                        'created_at' => now()->toIso8601String(),
                    ];
                } elseif ($t->status_sewa === 'selesai') {
                    $notifications[] = [
                        'id' => 'sewa_done_' . $t->id_transaksi,
                        'type' => 'transaction',
                        'title' => 'Sewa Selesai',
                        'message' => "Transaksi #{$t->id_transaksi} telah selesai dikembalikan secara lengkap. Terima kasih!",
                        'severity' => 'success',
                        'created_at' => now()->toIso8601String(),
                    ];
                }

                // Status Pembayaran (pembayaran table)
                if ($t->pembayaran) {
                    $p = $t->pembayaran;
                    if ($p->status_bayar === 'pending') {
                        $notifications[] = [
                            'id' => 'pay_pending_' . $p->id_pembayaran,
                            'type' => 'payment',
                            'title' => 'Konfirmasi Pembayaran',
                            'message' => "Bukti pembayaran transaksi #{$t->id_transaksi} sedang diverifikasi oleh admin.",
                            'severity' => 'info',
                            'created_at' => now()->toIso8601String(),
                        ];
                    } elseif ($p->status_bayar === 'gagal') {
                        $notifications[] = [
                            'id' => 'pay_failed_' . $p->id_pembayaran,
                            'type' => 'payment',
                            'title' => 'Pembayaran Gagal',
                            'message' => "Pembayaran transaksi #{$t->id_transaksi} gagal atau ditolak. Mohon unggah bukti pembayaran yang valid.",
                            'severity' => 'danger',
                            'created_at' => now()->toIso8601String(),
                        ];
                    }
                }
            }
        } elseif ($user->peran_pengguna === 'admin') {
            // 1. Peringatan Stok Kritis (stok <= 1)
            $criticalGears = Barang::where('jumlah_stok', '<=', 1)->get();
            foreach ($criticalGears as $g) {
                $notifications[] = [
                    'id' => 'stock_crit_' . $g->id_barang,
                    'type' => 'stock_warning',
                    'title' => 'Peringatan Stok Kritis',
                    'message' => "Stok peralatan '{$g->nama_barang}' tinggal {$g->jumlah_stok} unit. Segera lakukan update stok!",
                    'severity' => 'danger',
                    'created_at' => now()->toIso8601String(),
                ];
            }

            // 2. Verifikasi KTP Baru
            $pendingVerifs = Verifikasi::with('pengguna')
                ->where('status_verifikasi', 'pending')
                ->get();
            
            foreach ($pendingVerifs as $v) {
                $nama = $v->pengguna ? $v->pengguna->nama : 'Pengguna';
                $notifications[] = [
                    'id' => 'admin_verif_pending_' . $v->id_verifikasi,
                    'type' => 'admin_verification',
                    'title' => 'Verifikasi KTP Baru',
                    'message' => "Ada pengajuan verifikasi KTP baru dari '{$nama}' yang memerlukan persetujuan Anda.",
                    'severity' => 'info',
                    'created_at' => now()->toIso8601String(),
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }
}
