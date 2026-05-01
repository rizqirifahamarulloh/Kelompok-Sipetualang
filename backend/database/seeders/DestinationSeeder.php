<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            ['name' => 'Gunung', 'description' => 'Pendakian gunung dan trekking di ketinggian'],
            ['name' => 'Pantai', 'description' => 'Camping dan aktivitas di area pantai'],
            ['name' => 'Curug', 'description' => 'Eksplorasi air terjun dan sungai'],
            ['name' => 'Hutan', 'description' => 'Jungle trekking dan survival di hutan'],
            ['name' => 'Danau', 'description' => 'Camping dan aktivitas di area danau'],
        ];

        foreach ($destinations as $destination) {
            Destination::create([
                'name' => $destination['name'],
                'slug' => Str::slug($destination['name']),
                'description' => $destination['description'],
                'is_active' => true,
            ]);
        }
    }
}
