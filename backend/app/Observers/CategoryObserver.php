<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\PerformanceCacheManager;

class CategoryObserver
{
    public function created(Category $category): void
    {
        PerformanceCacheManager::invalidateCategories();
    }

    public function updated(Category $category): void
    {
        PerformanceCacheManager::invalidateCategories();
    }

    public function deleted(Category $category): void
    {
        PerformanceCacheManager::invalidateCategories();
    }
}
