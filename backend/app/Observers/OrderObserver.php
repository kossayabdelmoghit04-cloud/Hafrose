<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\PerformanceCacheManager;

class OrderObserver
{
    public function created(Order $order): void
    {
        PerformanceCacheManager::invalidateDashboard();
    }

    public function updated(Order $order): void
    {
        PerformanceCacheManager::invalidateDashboard();
    }

    public function deleted(Order $order): void
    {
        PerformanceCacheManager::invalidateDashboard();
    }
}
