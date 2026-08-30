<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $tenant = $user->current_tenant;

        if (! $tenant || ! $user->isOwner()) {
            return to_route('dashboard');
        }

        return Inertia::render('settings/tenant', [
            'center' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'address' => $tenant->address,
                'logo' => $tenant->logo,
                'timezone' => $tenant->timezone,
                'currency' => $tenant->currency,
                'currency_symbol' => $tenant->currency_symbol,
                'academic_year' => $tenant->academic_year,
                'receipt_prefix' => $tenant->receipt_prefix,
                'student_id_prefix' => $tenant->student_id_prefix,
                'default_attendance' => $tenant->default_attendance,
                'invoice_footer' => $tenant->invoice_footer,
                'primary_color' => $tenant->primary_color,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $tenant = $user->current_tenant;

        if (! $tenant || ! $user->isOwner()) {
            return to_route('dashboard');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'currency' => ['nullable', 'string', 'max:10'],
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'receipt_prefix' => ['nullable', 'string', 'max:20'],
            'student_id_prefix' => ['nullable', 'string', 'max:20'],
            'default_attendance' => ['nullable', 'string', 'in:manual,auto_absent'],
            'invoice_footer' => ['nullable', 'string', 'max:500'],
            'primary_color' => ['nullable', 'string', 'max:20'],
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo) {
                Storage::disk('public')->delete($tenant->logo);
            }
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $tenant->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Coaching center settings updated successfully.']);
    }
}
