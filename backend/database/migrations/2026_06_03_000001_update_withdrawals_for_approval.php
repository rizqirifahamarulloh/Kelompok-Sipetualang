<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Ubah enum status dari ['completed'] ke ['pending', 'completed', 'rejected']
        DB::statement("ALTER TABLE withdrawals MODIFY COLUMN status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending'");

        // 2. Tambah kolom transfer_proof untuk bukti transfer dari admin
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->string('transfer_proof')->nullable()->after('status');
            
            // Pastikan kolom admin_note ada (rename dari note jika perlu)
            if (Schema::hasColumn('withdrawals', 'note') && !Schema::hasColumn('withdrawals', 'admin_note')) {
                $table->renameColumn('note', 'admin_note');
            } elseif (!Schema::hasColumn('withdrawals', 'admin_note') && !Schema::hasColumn('withdrawals', 'note')) {
                $table->text('admin_note')->nullable()->after('transfer_proof');
            }
        });
    }

    public function down()
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            if (Schema::hasColumn('withdrawals', 'transfer_proof')) {
                $table->dropColumn('transfer_proof');
            }
        });

        DB::statement("ALTER TABLE withdrawals MODIFY COLUMN status ENUM('completed') DEFAULT 'completed'");
    }
};
