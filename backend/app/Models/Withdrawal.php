<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    use HasFactory;

    protected $table = 'withdrawals';
    public $timestamps = true;

    protected $fillable = [
        'user_id', 'amount', 'bank_name', 'bank_account_number',
        'bank_account_name', 'status', 'admin_note', 'processed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'id_pengguna');
    }
}
