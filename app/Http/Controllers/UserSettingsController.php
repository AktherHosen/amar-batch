<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserSettingsController extends Controller
{
    public function get(Request $request)
    {
        $user = $request->user();
        $settings = $user->settings;

        if (! $settings) {
            $settings = UserSetting::create([
                'user_id' => $user->id,
            ]);
        }

        return response()->json($settings);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'appearance' => ['nullable', 'string', 'in:light,dark,system'],
            'accent' => ['nullable', 'string', 'max:50'],
            'radius' => ['nullable', 'integer', 'min:0', 'max:16'],
            'date_format' => ['nullable', 'string', 'in:DD/MM/YYYY,MM/DD/YYYY,YYYY-MM-DD,DD.MM.YYYY'],
            'time_format' => ['nullable', 'string', 'in:12h,24h'],
            'sidebar_style' => ['nullable', 'string', 'in:full,compact'],
            'default_page' => ['nullable', 'string', 'in:dashboard,students,batches,attendance,fees'],
        ]);

        $user->settings()->updateOrCreate(
            ['user_id' => $user->id],
            $validated,
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Settings saved successfully.']);
    }
}
