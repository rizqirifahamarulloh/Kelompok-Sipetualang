<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the empty stub table first
        Schema::dropIfExists('foto_barang');

        Schema::create('foto_barang', function (Blueprint $table) {
            $table->id('id_foto');
            $table->unsignedBigInteger('id_barang');
            $table->string('foto_path', 255);
            $table->integer('urutan')->default(0);
            $table->timestamps();

            $table->foreign('id_barang')->references('id_barang')->on('barang')->onDelete('cascade');
            $table->index('id_barang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foto_barang');

        // Restore original empty stub
        Schema::create('foto_barang', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
