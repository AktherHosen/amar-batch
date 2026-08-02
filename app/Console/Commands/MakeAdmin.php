<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class MakeAdmin extends Command
{
    protected $signature = 'make:admin
                            {email? : Email address of the user to make admin}
                            {--create : Create a new admin user instead of promoting an existing one}';

    protected $description = 'Create a new admin user or promote an existing user to admin';

    public function handle(): int
    {
        $email = $this->argument('email');

        if ($this->option('create')) {
            return $this->createAdmin();
        }

        if (!$email) {
            $email = $this->ask('What is the email address of the user?');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");

            if ($this->confirm('Would you like to create a new admin with this email?')) {
                return $this->createAdmin($email);
            }

            return Command::FAILURE;
        }

        $user->update(['role' => 'admin']);
        $this->info("User {$user->name} ({$user->email}) has been promoted to admin.");
        return Command::SUCCESS;
    }

    private function createAdmin(?string $email = null): int
    {
        $name = $this->ask('What is the admin name?');
        $email = $email ?? $this->ask('What is the admin email?');
        $password = $this->secret('What is the admin password?');

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return Command::FAILURE;
        }

        $confirmPassword = $this->secret('Confirm the password');

        if ($password !== $confirmPassword) {
            $this->error('Passwords do not match.');
            return Command::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->info("Admin user created successfully:");
        $this->table(['Field', 'Value'], [
            ['Name', $user->name],
            ['Email', $user->email],
            ['Role', $user->role],
        ]);

        return Command::SUCCESS;
    }
}
