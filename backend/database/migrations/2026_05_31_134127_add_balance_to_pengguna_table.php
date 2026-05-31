<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->decimal('balance', 15, 2)->default(0)->after('no_telp');
            $table->decimal('total_earned', 15, 2)->default(0)->after('balance');
            $table->decimal('total_withdrawn', 15, 2)->default(0)->after('total_earned');
        });
    }

    public function down()
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn(['balance', 'total_earned', 'total_withdrawn']);
        });
    }
};
