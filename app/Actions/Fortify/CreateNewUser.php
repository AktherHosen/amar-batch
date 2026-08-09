<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'coaching_name' => ['required', 'string', 'max:255'],
            'coaching_email' => ['nullable', 'string', 'email', 'max:255'],
            'coaching_phone' => ['nullable', 'string', 'max:20'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Create tenant (coaching center)
            $tenant = Tenant::create([
                'name' => $input['coaching_name'],
                'slug' => Str::slug($input['coaching_name']),
                'email' => $input['coaching_email'] ?? $input['email'],
                'phone' => $input['coaching_phone'] ?? null,
                'is_active' => true,
            ]);

            // Assign default plan
            $defaultPlan = Plan::where('is_default', true)->first();
            if ($defaultPlan) {
                Subscription::create([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $defaultPlan->id,
                    'status' => 'trial',
                    'trial_ends_at' => now()->addDays(14),
                ]);
            }

            // Create owner user
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
                'role' => 'owner',
                'tenant_id' => $tenant->id,
                'is_approved' => true,
                'email_verified_at' => now(),
            ]);

            return $user;
        });
    }
}
