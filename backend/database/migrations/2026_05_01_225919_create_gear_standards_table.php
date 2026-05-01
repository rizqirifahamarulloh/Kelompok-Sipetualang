<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gear_standards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained('destinations')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->boolean('is_mandatory')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['destination_id', 'category_id'], 'unique_standard_per_destination');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gear_standards');
    }
};
