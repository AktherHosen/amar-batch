<?php

return [
    'sandbox' => env('SSLC_SANDBOX', true),

    'store' => [
        'id' => env('SSLC_STORE_ID'),
        'password' => env('SSLC_STORE_PASSWORD'),
        'currency' => env('SSLC_CURRENCY', 'BDT'),
    ],

    'api' => [
        'gateway_url' => env('SSLC_GATEWAY_URL', 'https://sandbox-gw.sslcommerz.com'),
        'validation_url' => env('SSLC_VALIDATION_URL', 'https://sandbox-gw.sslcommerz.com'),
    ],

    'product_profile' => 'non-physical-goods',

    'routes' => [
        'success' => env('SSLC_SUCCESS_URL', '/payment/success'),
        'fail' => env('SSLC_FAIL_URL', '/payment/failure'),
        'cancel' => env('SSLC_CANCEL_URL', '/payment/cancel'),
        'ipn' => env('SSLC_IPN_URL', '/payment/ipn'),
    ],
];
