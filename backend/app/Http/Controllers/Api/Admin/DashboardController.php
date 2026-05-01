<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Gear;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get dashboard overview stats for super admin.
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'active_rentals' => Transaction::active()->count(),
            'gear_available' => Gear::available()->count(),
            'pending_verification' => User::ktpPending()->count(),
        ];

        $monthlyRevenue = Transaction::query()
            ->whereIn('status', ['paid', 'rented', 'completed'])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('SUM(total_cost) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(6)
            ->get();

        $rentalsByDestination = Transaction::query()
            ->join('destinations', 'transactions.destination_id', '=', 'destinations.id')
            ->selectRaw('destinations.name, COUNT(*) as total')
            ->groupBy('destinations.name')
            ->get();

        $recentTransactions = Transaction::with(['customer', 'details.gear', 'destination'])
            ->latest()
            ->limit(5)
            ->get();

        $lowStockGears = Gear::with('category')
            ->where('stock', '<=', 3)
            ->where('stock', '>', 0)
            ->orderBy('stock')
            ->limit(5)
            ->get();

        return $this->success([
            'stats' => $stats,
            'monthly_revenue' => $monthlyRevenue,
            'rentals_by_destination' => $rentalsByDestination,
            'recent_transactions' => $recentTransactions,
            'low_stock_alerts' => $lowStockGears,
        ], 'Dashboard data retrieved');
    }
}
