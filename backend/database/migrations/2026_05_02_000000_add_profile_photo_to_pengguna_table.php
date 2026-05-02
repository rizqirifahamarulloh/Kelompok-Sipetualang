// database/migrations/2026_05_02_000000_add_profile_photo_to_pengguna_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->string('profile_photo')->nullable()->after('foto_swafoto');
            $table->string('alamat')->nullable()->after('no_telp');
            $table->date('tanggal_lahir')->nullable()->after('alamat');
        });
    }

    public function down()
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn(['profile_photo', 'alamat', 'tanggal_lahir']);
        });
    }
};
