<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Notifikasi;
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

        if ($user->peran_pengguna === 'customer') {
            $this->syncCustomerNotifications($user);
        } elseif ($user->peran_pengguna === 'admin') {
            $this->syncAdminNotifications($user);
        }

        $notifications = Notifikasi::where('id_pengguna', $user->id_pengguna)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $notification = Notifikasi::where('id_notifikasi', $id)
            ->where('id_pengguna', $user->id_pengguna)
            ->first();

        if (!$notification) {
            return response()->json(['status' => 'error', 'message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['status' => 'success', 'message' => 'Notifikasi berhasil dihapus']);
    }

    public function markRead($id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $notification = Notifikasi::where('id_notifikasi', $id)
            ->where('id_pengguna', $user->id_pengguna)
            ->first();

        if (!$notification) {
            return response()->json(['status' => 'error', 'message' => 'Notification not found'], 404);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json(['status' => 'success', 'message' => 'Notifikasi ditandai telah dibaca']);
    }

    private function syncCustomerNotifications($user)
    {
        $this->upsertVerificationNotification($user);
        $this->upsertTransactionNotifications($user);
    }

    private function syncAdminNotifications($user)
    {
        $criticalGears = Barang::where('jumlah_stok', '<=', 1)->get();
        foreach ($criticalGears as $g) {
            $this->upsertNotification($user, 'stock_crit_' . $g->id_barang, [
                'type' => 'stock_warning',
                'title' => 'Peringatan Stok Kritis',
                'message' => "Stok peralatan '{$g->nama_barang}' tinggal {$g->jumlah_stok} unit. Segera lakukan update stok!",
                'severity' => 'danger',
                'data' => ['id_barang' => $g->id_barang],
            ]);
        }

        $pendingVerifs = Verifikasi::with('pengguna')
            ->where('status_verifikasi', 'pending')
            ->get();

        foreach ($pendingVerifs as $v) {
            $nama = $v->pengguna ? $v->pengguna->nama : 'Pengguna';
            $this->upsertNotification($user, 'admin_verif_pending_' . $v->id_verifikasi, [
                'type' => 'admin_verification',
                'title' => 'Verifikasi KTP Baru',
                'message' => "Ada pengajuan verifikasi KTP baru dari '{$nama}' yang memerlukan persetujuan Anda.",
                'severity' => 'info',
                'data' => ['id_verifikasi' => $v->id_verifikasi],
            ]);
        }
    }

    private function upsertVerificationNotification($user)
    {
        $verifStatus = $user->verification_status;

        if (!$verifStatus) {
            $this->upsertNotification($user, 'verif_none', [
                'type' => 'verification',
                'title' => 'Akun Belum Terverifikasi',
                'message' => 'Akun Anda belum terverifikasi. Silakan unggah foto KTP Anda di menu verifikasi untuk mulai menyewa.',
                'severity' => 'danger',
            ]);
        } elseif ($verifStatus === 'pending') {
            $this->upsertNotification($user, 'verif_pending', [
                'type' => 'verification',
                'title' => 'Verifikasi Diproses',
                'message' => 'Dokumen verifikasi KTP Anda sedang dalam proses peninjauan oleh Admin.',
                'severity' => 'warning',
            ]);
        } elseif ($verifStatus === 'disetujui') {
            $this->upsertNotification($user, 'verif_approved', [
                'type' => 'verification',
                'title' => 'Verifikasi Berhasil',
                'message' => 'Akun Anda telah berhasil diverifikasi. Anda sekarang dapat menyewa alat dengan penuh kemudahan.',
                'severity' => 'success',
            ]);
        } elseif ($verifStatus === 'ditolak') {
            $note = $user->verification_note ? ' Catatan: ' . $user->verification_note : '';
            $this->upsertNotification($user, 'verif_rejected', [
                'type' => 'verification',
                'title' => 'Verifikasi KTP Ditolak',
                'message' => 'Dokumen verifikasi KTP Anda ditolak oleh Admin.' . $note . ' Silakan ajukan ulang.',
                'severity' => 'danger',
            ]);
        }
    }

    private function upsertTransactionNotifications($user)
    {
        $transaksis = Transaksi::with('pembayaran')
            ->where('id_penyewa', $user->id_pengguna)
            ->orderBy('id_transaksi', 'desc')
            ->get();

        foreach ($transaksis as $t) {
            $this->upsertNotification($user, 'sewa_status_' . $t->id_transaksi . '_' . $t->status_sewa, [
                'type' => 'transaction',
                'title' => $this->getTransactionTitle($t),
                'message' => $this->getTransactionMessage($t),
                'severity' => $this->getTransactionSeverity($t),
                'data' => ['id_transaksi' => $t->id_transaksi, 'status_sewa' => $t->status_sewa],
            ]);

            if ($t->pembayaran) {
                $p = $t->pembayaran;
                $this->upsertNotification($user, 'payment_status_' . $p->id_pembayaran . '_' . $p->status_bayar, [
                    'type' => 'payment',
                    'title' => $this->getPaymentTitle($t, $p),
                    'message' => $this->getPaymentMessage($t, $p),
                    'severity' => $this->getPaymentSeverity($p),
                    'data' => ['id_pembayaran' => $p->id_pembayaran, 'status_bayar' => $p->status_bayar],
                ]);
            }
        }
    }

    private function upsertNotification($user, $uniqueKey, array $attributes)
    {
        Notifikasi::updateOrCreate(
            [
                'id_pengguna' => $user->id_pengguna,
                'unique_key' => $uniqueKey,
            ],
            array_merge($attributes, [
                'id_pengguna' => $user->id_pengguna,
                'unique_key' => $uniqueKey,
            ])
        );
    }

    private function getTransactionTitle($transaksi)
    {
        return match ($transaksi->status_sewa) {
            'menunggu_pembayaran' => 'Menunggu Pembayaran',
            'dibayar' => 'Pembayaran Berhasil',
            'sedang_disewa' => 'Peralatan Sedang Disewa',
            'selesai' => 'Sewa Selesai',
            default => 'Status Transaksi',
        };
    }

    private function getTransactionMessage($transaksi)
    {
        return match ($transaksi->status_sewa) {
            'menunggu_pembayaran' => "Transaksi #{$transaksi->id_transaksi} dengan total Rp " . number_format($transaksi->total_biaya, 0, ',', '.') . " menunggu pembayaran Anda.",
            'dibayar' => "Pembayaran transaksi #{$transaksi->id_transaksi} telah dikonfirmasi. Peralatan siap diambil.",
            'sedang_disewa' => "Anda sedang menyewa peralatan dari Transaksi #{$transaksi->id_transaksi}. Tanggal kembali: " . date('d-m-Y', strtotime($transaksi->tanggal_selesai)),
            'selesai' => "Transaksi #{$transaksi->id_transaksi} telah selesai dikembalikan secara lengkap. Terima kasih!",
            default => "Status transaksi #{$transaksi->id_transaksi} diperbarui.",
        };
    }

    private function getTransactionSeverity($transaksi)
    {
        return match ($transaksi->status_sewa) {
            'menunggu_pembayaran' => 'warning',
            'dibayar' => 'success',
            'sedang_disewa' => 'info',
            'selesai' => 'success',
            default => 'info',
        };
    }

    private function getPaymentTitle($transaksi, $pembayaran)
    {
        return match ($pembayaran->status_bayar) {
            'pending' => 'Konfirmasi Pembayaran',
            'gagal' => 'Pembayaran Gagal',
            'berhasil' => 'Pembayaran Berhasil',
            default => 'Status Pembayaran',
        };
    }

    private function getPaymentMessage($transaksi, $pembayaran)
    {
        return match ($pembayaran->status_bayar) {
            'pending' => "Bukti pembayaran transaksi #{$transaksi->id_transaksi} sedang diverifikasi oleh admin.",
            'gagal' => "Pembayaran transaksi #{$transaksi->id_transaksi} gagal atau ditolak. Mohon unggah bukti pembayaran yang valid.",
            'berhasil' => "Pembayaran transaksi #{$transaksi->id_transaksi} telah berhasil dikonfirmasi.",
            default => "Status pembayaran transaksi #{$transaksi->id_transaksi} diperbarui.",
        };
    }

    private function getPaymentSeverity($pembayaran)
    {
        return match ($pembayaran->status_bayar) {
            'pending' => 'info',
            'gagal' => 'danger',
            'berhasil' => 'success',
            default => 'info',
        };
    }
}
