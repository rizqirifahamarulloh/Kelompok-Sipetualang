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
        Schema::table('transaksi', function (Blueprint $table) {
            $table->unsignedBigInteger('id_voucher')->nullable()->after('id_transaksi');
            $table->decimal('diskon_voucher', 15, 2)->default(0)->after('fee_admin');
            $table->decimal('total_setelah_diskon', 15, 2)->nullable()->after('diskon_voucher');

            $table->foreign('id_voucher')
                ->references('id')
                ->on('vouchers')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Voucher::class, 'id_voucher');
            $table->dropColumn(['id_voucher', 'diskon_voucher', 'total_setelah_diskon']);
        });
    }
};
