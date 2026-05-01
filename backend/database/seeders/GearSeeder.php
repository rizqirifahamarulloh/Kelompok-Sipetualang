<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Gear;
use App\Models\User;
use Illuminate\Database\Seeder;

class GearSeeder extends Seeder
{
    public function run(): void
    {
        $penyewa1 = User::where('email', 'budi@sipetualang.com')->first();
        $penyewa2 = User::where('email', 'siti@sipetualang.com')->first();

        $gears = [
            // Penyewa 1 — Budi Santoso
            ['owner' => $penyewa1, 'category' => 'Tenda', 'name' => 'Tenda Dome 4P', 'price' => 75000, 'stock' => 5, 'condition' => 'good'],
            ['owner' => $penyewa1, 'category' => 'Tenda', 'name' => 'Tenda Merapi 2P', 'price' => 50000, 'stock' => 3, 'condition' => 'good'],
            ['owner' => $penyewa1, 'category' => 'Carrier', 'name' => 'Carrier 60L Eiger', 'price' => 50000, 'stock' => 8, 'condition' => 'good'],
            ['owner' => $penyewa1, 'category' => 'Sleeping Bag', 'name' => 'Sleeping Bag Polar', 'price' => 25000, 'stock' => 10, 'condition' => 'good'],
            ['owner' => $penyewa1, 'category' => 'Kompor', 'name' => 'Kompor Portable', 'price' => 30000, 'stock' => 6, 'condition' => 'good'],
            ['owner' => $penyewa1, 'category' => 'Matras', 'name' => 'Matras Karet', 'price' => 15000, 'stock' => 2, 'condition' => 'fair'],
            ['owner' => $penyewa1, 'category' => 'Gas Kaleng', 'name' => 'Gas Kaleng 230g', 'price' => 35000, 'stock' => 3, 'condition' => 'new'],

            // Penyewa 2 — Siti Aminah
            ['owner' => $penyewa2, 'category' => 'Headlamp', 'name' => 'Headlamp Energizer', 'price' => 20000, 'stock' => 1, 'condition' => 'good'],
            ['owner' => $penyewa2, 'category' => 'Sepatu', 'name' => 'Sepatu Trekking', 'price' => 45000, 'stock' => 4, 'condition' => 'good'],
            ['owner' => $penyewa2, 'category' => 'Jaket', 'name' => 'Jaket Windbreaker', 'price' => 35000, 'stock' => 6, 'condition' => 'good'],
            ['owner' => $penyewa2, 'category' => 'Trekking Pole', 'name' => 'Trekking Pole Aluminium', 'price' => 25000, 'stock' => 5, 'condition' => 'good'],
            ['owner' => $penyewa2, 'category' => 'Perlengkapan Masak', 'name' => 'Nesting Set 3in1', 'price' => 30000, 'stock' => 4, 'condition' => 'good'],
            ['owner' => $penyewa2, 'category' => 'Hammock', 'name' => 'Hammock Parasut', 'price' => 25000, 'stock' => 7, 'condition' => 'new'],
        ];

        foreach ($gears as $data) {
            $category = Category::where('name', $data['category'])->first();

            Gear::create([
                'owner_id' => $data['owner']->id,
                'category_id' => $category->id,
                'name' => $data['name'],
                'rental_price' => $data['price'],
                'stock' => $data['stock'],
                'condition' => $data['condition'],
                'status' => 'available',
            ]);
        }
    }
}
