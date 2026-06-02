<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            $table->integer('edited_count')->default(0)->after('rating');
            $table->timestamp('edited_at')->nullable()->after('edited_count');
        });
    }

    public function down(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            $table->dropColumn(['edited_count', 'edited_at']);
        });
    }
};
