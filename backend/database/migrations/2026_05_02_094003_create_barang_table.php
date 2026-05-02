<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->id('id_barang');
            $table->unsignedBigInteger('id_pemilik');
            $table->unsignedBigInteger('id_kategori');
            
            $table->string('nama_barang', 100);
            $table->decimal('harga_sewa', 10, 2);
            $table->integer('jumlah_stok')->default(0);
            $table->enum('status_barang', ['tersedia', 'habis'])->default('tersedia');
            $table->enum('status_persetujuan', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->timestamps();

            $table->foreign('id_pemilik')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_kategori')->references('id_kategori')->on('kategori')->onDelete('cascade');
            $table->unique(['id_pemilik', 'id_kategori', 'nama_barang', 'harga_sewa'], 'unique_barang_per_pemilik');
        });
    }

    public function down()
    {
        Schema::dropIfExists('barang');
    }
};
