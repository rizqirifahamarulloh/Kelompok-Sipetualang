<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code', 20)->unique();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('destination_id')->nullable()->constrained('destinations')->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_cost', 12, 2);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->enum('status', [
                'pending_payment',
                'paid',
                'rented',
                'completed',
                'cancelled',
                'overdue',
            ])->default('pending_payment');
            $table->date('actual_return_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
