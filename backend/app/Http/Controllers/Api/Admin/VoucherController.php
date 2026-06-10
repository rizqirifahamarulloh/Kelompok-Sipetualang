<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    protected $voucherService;

    public function __construct(VoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    /**
     * Get all vouchers with usage statistics
     */
    public function index(Request $request)
    {
        $query = Voucher::query();

        // Filter by status
        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by validity
        if ($request->has('validity')) {
            $validity = $request->validity;
            if ($validity === 'valid') {
                $query->where('is_active', true)
                    ->where('tanggal_mulai', '<=', now())
                    ->where('tanggal_selesai', '>=', now());
            } elseif ($validity === 'expired') {
                $query->where('tanggal_selesai', '<', now());
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('kode_voucher', 'like', "%$search%")
                ->orWhere('nama_voucher', 'like', "%$search%");
        }

        $vouchers = $query->orderBy('created_at', 'desc')->paginate(15);

        // Add usage statistics
        $vouchers->getCollection()->transform(function ($voucher) {
            return $this->attachVoucherStats($voucher);
        });

        return response()->json([
            'status' => 'success',
            'data' => $vouchers->items(),
            'pagination' => [
                'current_page' => $vouchers->currentPage(),
                'per_page' => $vouchers->perPage(),
                'total' => $vouchers->total(),
                'last_page' => $vouchers->lastPage(),
            ]
        ]);
    }

    /**
     * Create new voucher
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_voucher' => 'required|string|unique:vouchers|max:50',
            'nama_voucher' => 'required|string|max:100',
            'tipe_diskon' => 'required|in:percentage,fixed',
            'nilai_diskon' => 'required|numeric|min:0',
            'min_pembelian' => 'required|numeric|min:0',
            'max_diskon' => 'nullable|numeric|min:0',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'kuota' => 'required|integer|min:0',
        ]);

        // Validation for percentage type
        if ($validated['tipe_diskon'] === 'percentage') {
            if ($validated['nilai_diskon'] > 100) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nilai diskon percentage tidak boleh lebih dari 100'
                ], 422);
            }
        }

        $voucher = Voucher::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil dibuat',
            'data' => $this->attachVoucherStats($voucher)
        ], 201);
    }

    /**
     * Show single voucher detail
     */
    public function show($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher = $this->attachVoucherStats($voucher);

        // Get recent usages
        $recentUsages = VoucherUsage::where('id_voucher', $id)
            ->with('pengguna:id,nama_pengguna,email')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $voucher,
            'recent_usages' => $recentUsages
        ]);
    }

    /**
     * Update voucher
     */
    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'nama_voucher' => 'sometimes|string|max:100',
            'tipe_diskon' => 'sometimes|in:percentage,fixed',
            'nilai_diskon' => 'sometimes|numeric|min:0',
            'min_pembelian' => 'sometimes|numeric|min:0',
            'max_diskon' => 'nullable|numeric|min:0',
            'tanggal_mulai' => 'sometimes|date',
            'tanggal_selesai' => 'sometimes|date',
            'kuota' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate date range if both dates are provided
        if (isset($validated['tanggal_mulai']) && isset($validated['tanggal_selesai'])) {
            if ($validated['tanggal_selesai'] <= $validated['tanggal_mulai']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tanggal selesai harus setelah tanggal mulai'
                ], 422);
            }
        }

        // Validate percentage
        if (isset($validated['tipe_diskon']) && $validated['tipe_diskon'] === 'percentage') {
            if (isset($validated['nilai_diskon']) && $validated['nilai_diskon'] > 100) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nilai diskon percentage tidak boleh lebih dari 100'
                ], 422);
            }
        }

        $voucher->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil diperbarui',
            'data' => $this->attachVoucherStats($voucher)
        ]);
    }

    /**
     * Delete voucher
     */
    public function destroy($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil dihapus'
        ]);
    }

    /**
     * Get voucher usage statistics
     */
    public function statistics()
    {
        $totalVouchers = Voucher::count();
        $activeVouchers = Voucher::where('is_active', true)
            ->where('tanggal_mulai', '<=', now())
            ->where('tanggal_selesai', '>=', now())
            ->count();

        $totalUsages = VoucherUsage::count();
        $totalDiscountGiven = VoucherUsage::sum('diskon_dapat');

        $topVouchers = Voucher::withCount('usages')
            ->orderBy('usages_count', 'desc')
            ->limit(5)
            ->get(['id', 'kode_voucher', 'nama_voucher']);

        // Top vouchers with total discount
        $topVouchers->transform(function ($v) {
            $totalDiscount = VoucherUsage::where('id_voucher', $v->id)->sum('diskon_dapat');
            $v->total_discount = $totalDiscount;
            return $v;
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_vouchers' => $totalVouchers,
                'active_vouchers' => $activeVouchers,
                'total_usages' => $totalUsages,
                'total_discount_given' => $totalDiscountGiven,
                'top_vouchers' => $topVouchers
            ]
        ]);
    }

    /**
     * Attach stats to voucher
     */
    private function attachVoucherStats($voucher)
    {
        $voucher->total_discount_given = VoucherUsage::where('id_voucher', $voucher->id)
            ->sum('diskon_dapat');
        $voucher->total_usages = $voucher->usages()->count();
        $voucher->remaining_quota = $voucher->kuota == 0 ? -1 : ($voucher->kuota - $voucher->used_count);
        $voucher->is_expired = now() > $voucher->tanggal_selesai;
        $voucher->is_valid = $voucher->isValid();

        return $voucher;
    }
}
