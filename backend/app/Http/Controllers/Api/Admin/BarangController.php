<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barang;
use App\Models\StandarAlat;
use Illuminate\Support\Facades\Auth;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with(['kategori', 'pemilik'])
            ->where('status_persetujuan', 'disetujui')
            ->where('status_barang', 'tersedia');

        // Filter by Kategori (Side bar dropdown)
        if ($request->has('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }

        // Search by Nama Barang
        if ($request->has('search')) {
            $query->where('nama_barang', 'like', '%' . $request->search . '%');
        }

        // Search Advance: Destinasi
        if ($request->has('id_destinasi')) {
            // Rekomendasikan barang berdasarkan standar alat destinasi
            $standarKategori = StandarAlat::where('id_destinasi', $request->id_destinasi)
                ->pluck('id_kategori');

            if ($standarKategori->isNotEmpty()) {
                $query->whereIn('id_kategori', $standarKategori);
            }
        }

        $barang = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $barang
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_kategori' => 'required|exists:kategori,id_kategori',
            'nama_barang' => 'required|string|max:100',
            'harga_sewa' => 'required|numeric',
            'jumlah_stok' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        $barang = Barang::create([
            'id_pemilik' => $user->id_pengguna,
            'id_kategori' => $request->id_kategori,
            'nama_barang' => $request->nama_barang,
            'harga_sewa' => $request->harga_sewa,
            'jumlah_stok' => $request->jumlah_stok,
            'status_barang' => 'tersedia',
            'status_persetujuan' => 'menunggu', // Harus disetujui Admin Dev
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil diajukan, menunggu persetujuan Admin',
            'id_barang' => $barang->id_barang
        ], 201);
    }

    public function myItems()
    {
        $user = Auth::user();
        $barang = Barang::with('kategori')
            ->where('id_pemilik', $user->id_pengguna)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $barang
        ]);
    }
}
