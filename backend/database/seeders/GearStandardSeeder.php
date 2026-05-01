<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\GearStandard;
use Illuminate\Database\Seeder;

class GearStandardSeeder extends Seeder
{
    public function run(): void
    {
        $standards = [
            'Gunung' => [
                ['category' => 'Tenda', 'mandatory' => true],
                ['category' => 'Carrier', 'mandatory' => true],
                ['category' => 'Sleeping Bag', 'mandatory' => true],
                ['category' => 'Kompor', 'mandatory' => false],
                ['category' => 'Matras', 'mandatory' => true],
                ['category' => 'Headlamp', 'mandatory' => true],
                ['category' => 'Jaket', 'mandatory' => true],
                ['category' => 'Trekking Pole', 'mandatory' => false],
            ],
            'Pantai' => [
                ['category' => 'Tenda', 'mandatory' => true],
                ['category' => 'Matras', 'mandatory' => false],
                ['category' => 'Kompor', 'mandatory' => false],
                ['category' => 'Hammock', 'mandatory' => false],
            ],
            'Curug' => [
                ['category' => 'Carrier', 'mandatory' => true],
                ['category' => 'Sepatu', 'mandatory' => true],
                ['category' => 'Headlamp', 'mandatory' => false],
            ],
            'Hutan' => [
                ['category' => 'Tenda', 'mandatory' => true],
                ['category' => 'Carrier', 'mandatory' => true],
                ['category' => 'Sleeping Bag', 'mandatory' => true],
                ['category' => 'Headlamp', 'mandatory' => true],
                ['category' => 'Sepatu', 'mandatory' => true],
                ['category' => 'Hammock', 'mandatory' => false],
            ],
            'Danau' => [
                ['category' => 'Tenda', 'mandatory' => true],
                ['category' => 'Kompor', 'mandatory' => false],
                ['category' => 'Perlengkapan Masak', 'mandatory' => false],
            ],
        ];

        foreach ($standards as $destName => $items) {
            $destination = Destination::where('name', $destName)->first();

            foreach ($items as $item) {
                $category = Category::where('name', $item['category'])->first();

                GearStandard::create([
                    'destination_id' => $destination->id,
                    'category_id' => $category->id,
                    'is_mandatory' => $item['mandatory'],
                ]);
            }
        }
    }
}
