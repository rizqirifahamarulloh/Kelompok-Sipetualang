<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barang;
use App\Models\StandarAlat;
use Illuminate\Support\Facades\Auth;

class BarangController extends Controller
{
    /**
     * Display a listing of all gears with filters & search.
     */
    public function index(Request $request)
    {
        try {
            $query = Barang::with(['kategori', 'pemilik', 'destinasi']);

            // Filter by Kategori
            if ($request->has('id_kategori') && !empty($request->id_kategori)) {
                $query->where('id_kategori', $request->id_kategori);
            }

            // Search by Nama Barang
            if ($request->has('search') && !empty($request->search)) {
                $query->where('nama_barang', 'like', '%' . $request->search . '%');
            }

            // Filter by Status Barang
            if ($request->has('status_barang') && !empty($request->status_barang)) {
                $query->where('status_barang', $request->status_barang);
            }

            // Filter by Status Approval
            if ($request->has('status_approval') && !empty($request->status_approval)) {
                $query->where('status_approval', $request->status_approval);
            }

            $barang = $query->orderBy('id_barang', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'data' => $barang
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics of gears.
     */
    public function stats()
    {
        try {
            $total_alat = Barang::count();
            $tersedia = Barang::where('status_barang', 'tersedia')->count();
            $habis = Barang::where('status_barang', 'habis')->count();
            $stok_kritis = Barang::where('jumlah_stok', '<=', 1)->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_alat' => $total_alat,
                    'tersedia' => $tersedia,
                    'habis' => $habis,
                    'stok_kritis' => $stok_kritis
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified gear.
     */
    public function show($id)
    {
        try {
            $barang = Barang::with(['kategori', 'pemilik', 'destinasi'])->find($id);

            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $barang
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified gear.
     */
    public function update(Request $request, $id)
    {
        try {
            $barang = Barang::find($id);

            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            $request->validate([
                'nama_barang' => 'sometimes|required|string|max:100',
                'harga_sewa' => 'sometimes|required|numeric',
                'min_durasi_sewa' => 'nullable|integer|min:1',
                'min_tanggal_sewa' => 'nullable|date',
                'max_tanggal_pengembalian' => 'nullable|date',
                'jumlah_stok' => 'sometimes|required|integer',
                'id_kategori' => 'sometimes|required|exists:kategori,id_kategori',
                'status_barang' => 'sometimes|required|in:tersedia,habis',
                'status_approval' => 'sometimes|required|in:pending,disetujui,ditolak',
                'alasan_ditolak' => 'nullable|string|max:500',
                'deskripsi' => 'nullable|string',
                'foto_barang' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'destinasi_ids' => 'nullable',
            ]);

            // Update attributes if provided
            if ($request->has('nama_barang')) $barang->nama_barang = $request->nama_barang;
            if ($request->has('harga_sewa')) $barang->harga_sewa = $request->harga_sewa;
            if ($request->has('min_durasi_sewa')) $barang->min_durasi_sewa = intval($request->min_durasi_sewa) ?: 1;
            if ($request->has('jumlah_stok')) {
                $barang->jumlah_stok = $request->jumlah_stok;
                $barang->status_barang = $request->jumlah_stok > 0 ? 'tersedia' : 'habis';
            }
            if ($request->has('id_kategori')) $barang->id_kategori = $request->id_kategori;
            if ($request->has('status_barang')) $barang->status_barang = $request->status_barang;
            if ($request->has('status_approval')) {
                $barang->status_approval = $request->status_approval;
                if ($request->status_approval === 'disetujui') {
                    $barang->status_penyerahan = 'diterima';
                    $barang->alasan_ditolak = null; // Clear rejection reason when approved
                }
                if ($request->status_approval === 'pending') {
                    $barang->alasan_ditolak = null; // Clear rejection reason when reset to pending
                }
                if ($request->status_approval === 'ditolak' && $request->has('alasan_ditolak')) {
                    $barang->alasan_ditolak = $request->alasan_ditolak;
                }
            }
            if ($request->has('deskripsi')) $barang->deskripsi = $request->deskripsi;
            if ($request->has('min_tanggal_sewa')) {
                $barang->min_tanggal_sewa = $request->min_tanggal_sewa ?: null;
            }
            if ($request->has('max_tanggal_pengembalian')) {
                $barang->max_tanggal_pengembalian = $request->max_tanggal_pengembalian ?: null;
            }

            // Handle photo upload
            if ($request->hasFile('foto_barang')) {
                $path = $request->file('foto_barang')->store('barang', 'public');
                $barang->foto_barang = $path;
            }

            // Sync destinasi_ids to standar_alat (direct item-level association)
            if ($request->has('destinasi_ids')) {
                $destinasiIds = $request->destinasi_ids;
                if (is_string($destinasiIds)) {
                    $decoded = json_decode($destinasiIds, true);
                    if (is_array($decoded)) {
                        $destinasiIds = $decoded;
                    } else {
                        $destinasiIds = explode(',', $destinasiIds);
                    }
                }
                
                // Delete old mappings for this specific gear item (id_barang)
                \App\Models\StandarAlat::where('id_barang', $barang->id_barang)->delete();
                
                // Insert new mappings for this specific gear item (id_barang)
                if (is_array($destinasiIds)) {
                    foreach ($destinasiIds as $destId) {
                        if (!empty($destId)) {
                            \App\Models\StandarAlat::create([
                                'id_destinasi' => intval($destId),
                                'id_barang' => $barang->id_barang
                            ]);
                        }
                    }
                }
            }

            $barang->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Alat berhasil diperbarui',
                'data' => $barang->load(['kategori', 'pemilik', 'destinasi'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified gear.
     */
    public function destroy($id)
    {
        try {
            $barang = Barang::find($id);

            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            $barang->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Alat berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit/Store item (legacy support).
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_kategori' => 'required|exists:kategori,id_kategori',
                'nama_barang' => 'required|string|max:100',
                'harga_sewa' => 'required|numeric',
                'jumlah_stok' => 'required|integer|min:1',
                'deskripsi' => 'nullable|string',
                'foto_barang' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            ]);

            $user = Auth::user();

            $photoPath = null;
            if ($request->hasFile('foto_barang')) {
                $photoPath = $request->file('foto_barang')->store('barang', 'public');
            }

            $barang = Barang::create([
                'id_pemilik' => $user->id_pengguna,
                'id_kategori' => $request->id_kategori,
                'nama_barang' => $request->nama_barang,
                'deskripsi' => $request->deskripsi,
                'harga_sewa' => $request->harga_sewa,
                'jumlah_stok' => $request->jumlah_stok,
                'status_barang' => 'tersedia',
                'status_approval' => 'pending',
                'butuh_verifikasi' => true,
                'foto_barang' => $photoPath,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Barang berhasil diajukan, menunggu persetujuan Admin',
                'data' => $barang
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
