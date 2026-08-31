<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;

class SslcommerzService
{
    private string $storeId;
    private string $storePassword;
    private string $currency;
    private bool $sandbox;
    private string $baseUrl;

    public function __construct()
    {
        $setting = PaymentSetting::forGateway('sslcommerz');

        if ($setting) {
            $this->storeId = $setting->store_id ?? config('sslcommerz.store.id', '');
            $this->storePassword = $setting->store_password ?? config('sslcommerz.store.password', '');
            $this->currency = $setting->currency ?? config('sslcommerz.store.currency', 'BDT');
            $this->sandbox = $setting->sandbox ?? config('sslcommerz.sandbox', true);
        } else {
            $this->storeId = config('sslcommerz.store.id', '');
            $this->storePassword = config('sslcommerz.store.password', '');
            $this->currency = config('sslcommerz.store.currency', 'BDT');
            $this->sandbox = config('sslcommerz.sandbox', true);
        }

        $this->baseUrl = $this->sandbox
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }

    /**
     * Initiate a payment and get the gateway URL.
     */
    public function initiatePayment(
        float $amount,
        string $tranId,
        string $productName,
        string $customerName,
        string $customerEmail,
        string $customerPhone = '',
        string $customerAddress = '',
        string $successUrl = '',
        string $failUrl = '',
        string $cancelUrl = '',
        string $ipnUrl = '',
    ): array {
        $data = [
            'store_id' => $this->storeId,
            'store_passwd' => $this->storePassword,
            'currency' => $this->currency,
            'total_amount' => $amount,
            'tran_id' => $tranId,
            'product_name' => $productName,
            'product_category' => 'Subscription',
            'product_profile' => 'non-physical-goods',
            'cus_name' => $customerName,
            'cus_email' => $customerEmail,
            'cus_phone' => $customerPhone ?: ' ',
            'cus_add1' => $customerAddress ?: ' ',
            'cus_city' => 'Dhaka',
            'cus_state' => ' ',
            'cus_postcode' => ' ',
            'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'num_of_item' => 1,
            'ship_name' => $customerName,
            'ship_add1' => $customerAddress ?: 'Dhaka',
            'ship_city' => 'Dhaka',
            'ship_state' => ' ',
            'ship_postcode' => ' ',
            'ship_country' => 'Bangladesh',
        ];

        if ($successUrl) $data['success_url'] = $successUrl;
        if ($failUrl) $data['fail_url'] = $failUrl;
        if ($cancelUrl) $data['cancel_url'] = $cancelUrl;
        if ($ipnUrl) $data['ipn_url'] = $ipnUrl;

        $response = Http::withoutVerifying()
            ->timeout(60)
            ->asForm()
            ->post("{$this->baseUrl}/gwprocess/v4/api.php", $data);

        $result = $response->json();

        return $result;
    }

    /**
     * Validate a payment transaction.
     */
    public function validatePayment(string $valId): array
    {
        $response = Http::withoutVerifying()
            ->timeout(60)
            ->get("{$this->baseUrl}/validator/api/validationserverAPI.php", [
                'val_id' => $valId,
                'store_id' => $this->storeId,
                'store_passwd' => $this->storePassword,
                'format' => 'json',
            ]);

        return $response->json();
    }
}
