<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gears', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('rental_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->enum('condition', ['new', 'good', 'fair', 'worn'])->default('good');
            $table->enum('status', ['available', 'unavailable'])->default('available');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['owner_id', 'category_id', 'name', 'rental_price'], 'unique_gear_per_owner');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gears');
    }
};
