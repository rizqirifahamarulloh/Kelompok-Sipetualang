<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Tenda', 'description' => 'Berbagai jenis tenda untuk camping dan hiking'],
            ['name' => 'Carrier', 'description' => 'Tas carrier untuk membawa perlengkapan'],
            ['name' => 'Sleeping Bag', 'description' => 'Kantong tidur untuk outdoor'],
            ['name' => 'Kompor', 'description' => 'Kompor portable untuk memasak di alam'],
            ['name' => 'Matras', 'description' => 'Alas tidur camping'],
            ['name' => 'Headlamp', 'description' => 'Lampu kepala untuk penerangan'],
            ['name' => 'Sepatu', 'description' => 'Sepatu hiking dan trekking'],
            ['name' => 'Jaket', 'description' => 'Jaket outdoor dan windbreaker'],
            ['name' => 'Trekking Pole', 'description' => 'Tongkat pendaki'],
            ['name' => 'Perlengkapan Masak', 'description' => 'Nesting dan alat masak outdoor'],
            ['name' => 'Gas Kaleng', 'description' => 'Tabung gas portable'],
            ['name' => 'Hammock', 'description' => 'Tempat tidur gantung'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'is_active' => true,
            ]);
        }
    }
}
