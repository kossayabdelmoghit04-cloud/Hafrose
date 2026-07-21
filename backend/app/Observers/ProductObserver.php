<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\PerformanceCacheManager;

class ProductObserver
{
    public function created(Product $product): void
    {
        PerformanceCacheManager::invalidateProducts();
    }

    public function updated(Product $product): void
    {
        PerformanceCacheManager::invalidateProducts();
    }

    public function deleted(Product $product): void
    {
        PerformanceCacheManager::invalidateProducts();
    }
}
