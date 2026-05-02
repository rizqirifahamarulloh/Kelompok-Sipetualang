<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;

class AdminBarangController extends Controller
{
    public function pendingItems()
    {
        $barang = Barang::with(['kategori', 'pemilik'])
            ->where('status_persetujuan', 'menunggu')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $barang
        ]);
    }

    public function approve($id)
    {
        $barang = Barang::findOrFail($id);
        $barang->update(['status_persetujuan' => 'disetujui']);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang disetujui, akan tampil di katalog'
        ]);
    }

    public function reject($id)
    {
        $barang = Barang::findOrFail($id);
        $barang->update(['status_persetujuan' => 'ditolak']);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang ditolak'
        ]);
    }
}
