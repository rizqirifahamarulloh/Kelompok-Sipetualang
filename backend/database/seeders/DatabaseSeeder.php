<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Order matters: roles → users → categories → destinations → gears → standards → transactions
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            DestinationSeeder::class,
            GearSeeder::class,
            GearStandardSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
