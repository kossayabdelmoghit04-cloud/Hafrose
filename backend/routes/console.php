<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('hafrose:backup --detailed')
    ->dailyAt(config('production.scheduler.backup_time', '02:00'))
    ->timezone(config('production.scheduler.timezone', 'UTC'))
    ->when(fn (): bool => (bool) config('production.scheduler.enabled', true))
    ->withoutOverlapping(180)
    ->onOneServer();
