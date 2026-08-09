<?php

return [
    'sandbox' => env('SSLC_SANDBOX', true),

    'store' => [
        'id' => env('SSLC_STORE_ID'),
        'password' => env('SSLC_STORE_PASSWORD'),
        'currency' => env('SSLC_STORE_CURRENCY', 'BDT'),
    ],

    'route' => [
        'success' => env('SSLC_ROUTE_SUCCESS', 'sslc.success'),
        'failure' => env('SSLC_ROUTE_FAILURE', 'sslc.failure'),
        'cancel' => env('SSLC_ROUTE_CANCEL', 'sslc.cancel'),
        'ipn' => env('SSLC_ROUTE_IPN', 'sslc.ipn'),
    ],

    'product_profile' => 'non-physical-goods',
];
