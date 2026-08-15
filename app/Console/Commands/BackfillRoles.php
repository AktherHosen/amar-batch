<?php

namespace App\Console\Commands;

use App\Support\DefaultRoles;
use Illuminate\Console\Command;

class BackfillRoles extends Command
{
    protected $signature = 'roles:backfill';

    protected $description = 'Seed default roles for all existing tenants';

    public function handle(): int
    {
        DefaultRoles::backfillAll();

        $count = \App\Models\Role::count();
        $this->info("Roles backfilled. Total roles: {$count}");

        return self::SUCCESS;
    }
}