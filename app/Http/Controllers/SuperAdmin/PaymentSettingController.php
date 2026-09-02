<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $setting = PaymentSetting::getForGateway('sslcommerz');

        return Inertia::render('super-admin/payment-settings', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'sandbox' => ['required', 'boolean'],
            'store_id' => ['nullable', 'string', 'max:255'],
            'store_password' => ['nullable', 'string', 'max:255'],
            'currency' => ['required', 'string', 'max:10'],
            'online_payment_enabled' => ['required', 'boolean'],
            'manual_payment_enabled' => ['required', 'boolean'],
            'manual_payment_instructions' => ['nullable', 'string'],
        ]);

        $setting = PaymentSetting::getForGateway('sslcommerz');
        $setting->update($validated);

        return back()->with('success', 'Payment settings updated.');
    }
}
