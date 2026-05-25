<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = false;
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function createTransaction($orderId, $amount, $items, $customerDetails)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ],
            'item_details' => $items,
            'customer_details' => $customerDetails,
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return ['snap_token' => $snapToken, 'order_id' => $orderId];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

        public function handleNotification()
    {
        $notification = new \Midtrans\Notification();

        return [
            'order_id' => $notification->order_id,
            'status' => $notification->transaction_status,
            'payment_type' => $notification->payment_type,
        ];
    }
}
