<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ─── Define Permissions ─────────────────────────────────────────

        $permissions = [
            // User management
            'users.view', 'users.create', 'users.update', 'users.delete',
            // Gear management
            'gears.view', 'gears.create', 'gears.update', 'gears.delete',
            // Category management
            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            // Destination management
            'destinations.view', 'destinations.create', 'destinations.update', 'destinations.delete',
            // Gear standards
            'gear_standards.view', 'gear_standards.create', 'gear_standards.update', 'gear_standards.delete',
            // Transaction management
            'transactions.view', 'transactions.create', 'transactions.update', 'transactions.delete',
            // Payment management
            'payments.view', 'payments.create', 'payments.update',
            // Deposit management
            'deposits.view', 'deposits.update',
            // KTP Verification
            'ktp.verify', 'ktp.reject',
            // Dashboard
            'dashboard.admin', 'dashboard.penyewa',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // ─── Define Roles ───────────────────────────────────────────────

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'api']);
        $superAdmin->givePermissionTo(Permission::all());

        $penyewa = Role::firstOrCreate(['name' => 'penyewa', 'guard_name' => 'api']);
        $penyewa->givePermissionTo([
            'gears.view', 'gears.create', 'gears.update', 'gears.delete',
            'transactions.view',
            'payments.view',
            'deposits.view',
            'dashboard.penyewa',
        ]);

        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
        $customer->givePermissionTo([
            'gears.view',
            'destinations.view',
            'gear_standards.view',
            'transactions.view', 'transactions.create',
            'payments.view', 'payments.create',
            'deposits.view',
        ]);
    }
}
