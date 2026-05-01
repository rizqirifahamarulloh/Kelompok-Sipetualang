<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Deposit;
use App\Models\Destination;
use App\Models\Gear;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::role('customer')->get();
        $destinations = Destination::all();

        $transactions = [
            [
                'customer_email' => 'budi@sipetualang.com',
                'is_customer' => false,
                'customer_name' => 'Budi Santoso',
                'destination' => 'Gunung',
                'gear_name' => 'Tenda Dome 4P',
                'qty' => 1,
                'start' => '2023-10-10',
                'end' => '2023-10-13',
                'status' => 'completed',
                'payment_status' => 'success',
                'total' => 150000,
            ],
            [
                'customer_email' => 'agus@gmail.com',
                'destination' => 'Gunung',
                'gear_name' => 'Sleeping Bag Polar',
                'qty' => 2,
                'start' => '2023-10-12',
                'end' => '2023-10-15',
                'status' => 'rented',
                'payment_status' => 'success',
                'total' => 45000,
            ],
            [
                'customer_email' => 'siti@sipetualang.com',
                'is_customer' => false,
                'customer_name' => 'Siti Aminah',
                'destination' => 'Gunung',
                'gear_name' => 'Carrier 60L Eiger',
                'qty' => 1,
                'start' => '2023-10-12',
                'end' => '2023-10-16',
                'status' => 'rented',
                'payment_status' => 'success',
                'total' => 200000,
            ],
            [
                'customer_email' => 'dewi@gmail.com',
                'destination' => 'Pantai',
                'gear_name' => 'Kompor Portable',
                'qty' => 1,
                'start' => '2023-10-14',
                'end' => '2023-10-16',
                'status' => 'completed',
                'payment_status' => 'success',
                'total' => 30000,
            ],
            [
                'customer_email' => 'rizky@gmail.com',
                'destination' => 'Gunung',
                'gear_name' => 'Tenda Merapi 2P',
                'qty' => 1,
                'start' => '2023-10-14',
                'end' => '2023-10-18',
                'status' => 'rented',
                'payment_status' => 'success',
                'total' => 120000,
            ],
            [
                'customer_email' => 'andi@gmail.com',
                'destination' => 'Curug',
                'gear_name' => 'Sepatu Trekking',
                'qty' => 1,
                'start' => '2023-10-16',
                'end' => '2023-10-18',
                'status' => 'pending_payment',
                'payment_status' => 'pending',
                'total' => 45000,
            ],
            [
                'customer_email' => 'maya@gmail.com',
                'destination' => 'Pantai',
                'gear_name' => 'Hammock Parasut',
                'qty' => 2,
                'start' => '2023-10-18',
                'end' => '2023-10-20',
                'status' => 'cancelled',
                'payment_status' => 'failed',
                'total' => 50000,
            ],
        ];

        foreach ($transactions as $idx => $data) {
            $customer = User::where('email', $data['customer_email'])->first();
            $destination = Destination::where('name', $data['destination'])->first();
            $gear = Gear::where('name', $data['gear_name'])->first();

            $trxCode = 'TRX-' . str_pad((string) ($idx + 1), 3, '0', STR_PAD_LEFT);

            $transaction = Transaction::create([
                'transaction_code' => $trxCode,
                'customer_id' => $customer->id,
                'destination_id' => $destination->id,
                'start_date' => $data['start'],
                'end_date' => $data['end'],
                'total_cost' => $data['total'],
                'deposit_amount' => $data['total'] * 0.3,
                'status' => $data['status'],
                'actual_return_date' => $data['status'] === 'completed' ? $data['end'] : null,
            ]);

            TransactionDetail::create([
                'transaction_id' => $transaction->id,
                'gear_id' => $gear->id,
                'quantity' => $data['qty'],
                'unit_price' => $gear->rental_price,
                'subtotal' => $data['total'],
            ]);

            Payment::create([
                'transaction_id' => $transaction->id,
                'amount' => $data['total'],
                'method' => ['bank_transfer', 'e_wallet', 'cash'][array_rand(['bank_transfer', 'e_wallet', 'cash'])],
                'status' => $data['payment_status'],
                'paid_at' => $data['payment_status'] === 'success' ? now() : null,
            ]);

            Deposit::create([
                'transaction_id' => $transaction->id,
                'amount' => $data['total'] * 0.3,
                'status' => $data['status'] === 'completed' ? 'returned' : 'held',
                'returned_amount' => $data['status'] === 'completed' ? $data['total'] * 0.3 : null,
                'processed_at' => $data['status'] === 'completed' ? now() : null,
            ]);
        }
    }
}
