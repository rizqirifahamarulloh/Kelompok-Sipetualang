<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('kode_voucher')->unique();
            $table->string('nama_voucher');
            $table->enum('tipe_diskon', ['percentage', 'fixed']);
            $table->decimal('nilai_diskon', 15, 2);
            $table->decimal('min_pembelian', 15, 2)->default(0);
            $table->decimal('max_diskon', 15, 2)->nullable();
            $table->dateTime('tanggal_mulai');
            $table->dateTime('tanggal_selesai');
            $table->integer('kuota')->default(0);
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
