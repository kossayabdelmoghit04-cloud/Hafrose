<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class RuntimeHealthCheckCommand extends Command
{
    protected $signature = 'hafrose:healthcheck';

    protected $description = 'Check the PHP runtime, database, and writable Laravel storage.';

    public function handle(): int
    {
        try {
            DB::select('SELECT 1');
            $probe = storage_path('framework/cache/.healthcheck');
            File::put($probe, 'ok');
            $valid = File::get($probe) === 'ok';
            File::delete($probe);

            return $valid ? self::SUCCESS : self::FAILURE;
        } catch (\Throwable $exception) {
            if (! $this->option('quiet')) {
                $this->error('Runtime healthcheck failed: '.$exception->getMessage());
            }

            return self::FAILURE;
        }
    }
}
