<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Ulasan;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UlasanController extends Controller
{
    /**
     * GET /api/ulasan/barang/{id}
     * Public — Get semua ulasan untuk barang tertentu
     */
    public function getByBarang($id)
    {
        $ulasan = Ulasan::where('id_barang', $id)
            ->with(['pengguna:id_pengguna,nama,profile_photo'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Hitung statistik
        $totalUlasan = $ulasan->count();
        $avgRating = $totalUlasan > 0 ? round($ulasan->avg('rating'), 1) : 0;

        // Count per bintang
        $starCounts = [];
        for ($i = 5; $i >= 1; $i--) {
            $starCounts[$i] = $ulasan->where('rating', $i)->count();
        }

        return response()->json([
            'ulasan' => $ulasan,
            'stats' => [
                'total' => $totalUlasan,
                'avg_rating' => $avgRating,
                'star_counts' => $starCounts,
            ],
        ]);
    }

    /**
     * POST /api/customer/ulasan
     * Auth — Submit ulasan baru (per barang per transaksi)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_transaksi' => 'required|integer|exists:transaksi,id_transaksi',
            'id_barang' => 'required|integer|exists:barang,id_barang',
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string|max:1000',
            'foto_ulasan' => 'nullable|array|max:5',
            'foto_ulasan.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Ambil transaksi
        $transaksi = Transaksi::find($request->id_transaksi);

        // Pastikan transaksi milik user (penyewa)
        if (!$transaksi || $transaksi->id_penyewa !== $user->id_pengguna) {
            return response()->json(['message' => 'Transaksi bukan milik Anda'], 403);
        }

        // Pastikan status selesai
        if ($transaksi->status_sewa !== 'selesai') {
            return response()->json(['message' => 'Ulasan hanya bisa diberikan untuk transaksi yang sudah selesai'], 400);
        }

        // Cek apakah barang benar ada dalam transaksi ini
        $detail = DetailTransaksi::where('id_transaksi', $request->id_transaksi)
            ->where('id_barang', $request->id_barang)
            ->first();

        if (!$detail) {
            return response()->json(['message' => 'Barang tidak ditemukan dalam transaksi ini'], 404);
        }

        // Cek apakah sudah pernah review untuk barang ini di transaksi ini
        $existing = Ulasan::where('id_transaksi', $request->id_transaksi)
            ->where('id_barang', $request->id_barang)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk barang ini'], 409);
        }

        // Handle multiple foto
        $fotoPaths = [];
        if ($request->hasFile('foto_ulasan')) {
            foreach ($request->file('foto_ulasan') as $file) {
                $fotoPaths[] = $file->store('ulasan', 'public');
            }
        }

        DB::beginTransaction();
        try {
            $ulasan = Ulasan::create([
                'id_transaksi' => $request->id_transaksi,
                'id_pengguna' => $user->id_pengguna,
                'id_barang' => $request->id_barang,
                'rating' => $request->rating,
                'komentar' => $request->komentar,
                'foto_ulasan' => !empty($fotoPaths) ? $fotoPaths : null,
                'edited_count' => 0,
                'edited_at' => null,
            ]);

            // Update rating barang
            $this->updateBarangRating($request->id_barang);

            DB::commit();

            $ulasan->load('pengguna:id_pengguna,nama,profile_photo');

            return response()->json([
                'message' => 'Ulasan berhasil disimpan',
                'ulasan' => $ulasan,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan ulasan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/customer/ulasan/{id}
     * Auth — Edit ulasan (maksimal 2x)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $ulasan = Ulasan::where('id_ulasan', $id)
            ->where('id_pengguna', $user->id_pengguna)
            ->first();

        if (!$ulasan) {
            return response()->json(['message' => 'Ulasan tidak ditemukan'], 404);
        }

        // Cek maksimal edit (2x)
        if ($ulasan->edited_count >= 2) {
            return response()->json([
                'message' => 'Anda sudah mencapai batas maksimal edit ulasan (2x)'
            ], 400);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string|max:1000',
            'foto_ulasan' => 'nullable|array|max:5',
            'foto_ulasan.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Handle foto baru
        $fotoPaths = $ulasan->foto_ulasan ?? [];
        if ($request->hasFile('foto_ulasan')) {
            $fotoPaths = [];
            foreach ($request->file('foto_ulasan') as $file) {
                $fotoPaths[] = $file->store('ulasan', 'public');
            }
        }

        DB::beginTransaction();
        try {
            $ulasan->update([
                'rating' => $request->rating,
                'komentar' => $request->komentar,
                'foto_ulasan' => !empty($fotoPaths) ? $fotoPaths : null,
                'edited_count' => $ulasan->edited_count + 1,
                'edited_at' => now(),
            ]);

            // Update rating barang
            $this->updateBarangRating($ulasan->id_barang);

            DB::commit();

            $ulasan->load('pengguna:id_pengguna,nama,profile_photo');

            return response()->json([
                'message' => 'Ulasan berhasil diperbarui',
                'ulasan' => $ulasan,
                'sisa_edit' => 2 - $ulasan->edited_count
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui ulasan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/customer/ulasan/check/{id_transaksi}
     * Auth — Cek ulasan per barang dalam transaksi
     */
    public function check($id_transaksi)
    {
        $user = Auth::user();

        // Ambil semua barang dalam transaksi
        $details = DetailTransaksi::where('id_transaksi', $id_transaksi)->get();

        $reviewStatus = [];
        foreach ($details as $detail) {
            $ulasan = Ulasan::where('id_transaksi', $id_transaksi)
                ->where('id_barang', $detail->id_barang)
                ->where('id_pengguna', $user->id_pengguna)
                ->first();

            $reviewStatus[] = [
                'id_ulasan' => $ulasan->id_ulasan ?? null,
                'id_barang' => $detail->id_barang,
                'nama_barang' => $detail->nama_barang,
                'has_reviewed' => $ulasan !== null,
                'ulasan' => $ulasan,
                'edited_count' => $ulasan->edited_count ?? 0,
                'sisa_edit' => $ulasan ? max(0, 2 - $ulasan->edited_count) : 0,
            ];
        }

        return response()->json([
            'data' => $reviewStatus,
            'all_reviewed' => collect($reviewStatus)->every(fn($item) => $item['has_reviewed']),
        ]);
    }

    /**
     * Update barang rating cache
     */
    private function updateBarangRating($id_barang)
    {
        $barang = Barang::find($id_barang);
        if ($barang) {
            $avgRating = Ulasan::where('id_barang', $id_barang)->avg('rating') ?? 0;
            $totalUlasan = Ulasan::where('id_barang', $id_barang)->count();

            $barang->avg_rating = round($avgRating, 1);
            $barang->total_ulasan = $totalUlasan;
            $barang->save();
        }
    }
}
