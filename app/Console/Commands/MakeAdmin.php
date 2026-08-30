<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class MakeAdmin extends Command
{
    protected $signature = 'make:admin
                            {email? : Email address of the user to make owner}
                            {--create : Create a new owner user instead of promoting an existing one}
                            {--tenant= : Tenant ID to assign the owner to}';

    protected $description = 'Create a new owner user or promote an existing user to owner';

    public function handle(): int
    {
        $email = $this->argument('email');

        if ($this->option('create')) {
            return $this->createAdmin();
        }

        if (! $email) {
            $email = $this->ask('What is the email address of the user?');
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");

            if ($this->confirm('Would you like to create a new owner with this email?')) {
                return $this->createAdmin($email);
            }

            return Command::FAILURE;
        }

        $user->update(['role' => 'owner']);
        $this->info("User {$user->name} ({$user->email}) has been promoted to owner.");

        return Command::SUCCESS;
    }

    private function createAdmin(?string $email = null): int
    {
        $name = $this->ask('What is the owner name?');
        $email = $email ?? $this->ask('What is the owner email?');
        $password = $this->secret('What is the owner password?');

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return Command::FAILURE;
        }

        $confirmPassword = $this->secret('Confirm the password');

        if ($password !== $confirmPassword) {
            $this->error('Passwords do not match.');

            return Command::FAILURE;
        }

        $tenantId = $this->option('tenant');

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        if ($tenantId) {
            $user->tenants()->attach($tenantId, ['role' => 'owner']);
        }

        $this->info('Owner user created successfully:');
        $this->table(['Field', 'Value'], [
            ['Name', $user->name],
            ['Email', $user->email],
            ['Role', $user->role],
            ['Tenant ID', $tenantId ?: 'None (Super Admin)'],
        ]);

        return Command::SUCCESS;
    }
}
