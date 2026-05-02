<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pengguna', function (Blueprint $table) {
            $table->id('id_pengguna');
            $table->string('nama', 100);
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->string('no_telp', 15)->nullable();
            $table->enum('peran_pengguna', ['pemilik', 'penyewa', 'admin']);
            $table->string('foto_ktp')->nullable();
            $table->string('foto_swafoto')->nullable();
            $table->boolean('verifikasi_ktp')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pengguna');
    }
};
