<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            if (!Schema::hasColumn('barang', 'avg_rating')) {
                $table->decimal('avg_rating', 2, 1)->default(0)->after('deskripsi');
            }
            if (!Schema::hasColumn('barang', 'total_ulasan')) {
                $table->integer('total_ulasan')->default(0)->after('avg_rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn(['avg_rating', 'total_ulasan']);
        });
    }
};
