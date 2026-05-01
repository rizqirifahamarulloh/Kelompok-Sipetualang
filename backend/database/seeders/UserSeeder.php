<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@sipetualang.com',
            'password' => 'password',
            'phone' => '081234567890',
            'ktp_status' => 'verified',
            'ktp_verified_at' => now(),
            'is_active' => true,
        ]);
        $admin->assignRole('super_admin');

        // Vendors (Gear Owners)
        $vendor1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@sipetualang.com',
            'password' => 'password',
            'phone' => '081234567891',
            'ktp_status' => 'verified',
            'ktp_verified_at' => now(),
            'is_active' => true,
        ]);
        $vendor1->assignRole('vendor');

        $vendor2 = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@sipetualang.com',
            'password' => 'password',
            'phone' => '081234567892',
            'ktp_status' => 'verified',
            'ktp_verified_at' => now(),
            'is_active' => true,
        ]);
        $vendor2->assignRole('vendor');

        // Customers
        $customers = [
            ['name' => 'Agus Setiawan', 'email' => 'agus@gmail.com', 'phone' => '081234567893'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@gmail.com', 'phone' => '081234567894'],
            ['name' => 'Rizky Ramadhan', 'email' => 'rizky@gmail.com', 'phone' => '081234567895'],
            ['name' => 'Andi Pratama', 'email' => 'andi@gmail.com', 'phone' => '081234567896'],
            ['name' => 'Maya Sari', 'email' => 'maya@gmail.com', 'phone' => '081234567897'],
        ];

        foreach ($customers as $data) {
            $customer = User::create(array_merge($data, [
                'password' => 'password',
                'ktp_status' => 'verified',
                'ktp_verified_at' => now(),
                'is_active' => true,
            ]));
            $customer->assignRole('customer');
        }

        // Pending KTP verification users
        $pending1 = User::create([
            'name' => 'Joko Widodo',
            'email' => 'joko@gmail.com',
            'password' => 'password',
            'phone' => '081234567898',
            'ktp_status' => 'pending',
            'is_active' => true,
        ]);
        $pending1->assignRole('customer');

        $pending2 = User::create([
            'name' => 'Mega Wati',
            'email' => 'mega@gmail.com',
            'password' => 'password',
            'phone' => '081234567899',
            'ktp_status' => 'pending',
            'is_active' => true,
        ]);
        $pending2->assignRole('customer');
    }
}
