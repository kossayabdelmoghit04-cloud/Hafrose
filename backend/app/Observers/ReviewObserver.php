<?php

namespace App\Observers;

use App\Models\Review;
use App\Services\PerformanceCacheManager;

class ReviewObserver
{
    public function created(Review $review): void
    {
        PerformanceCacheManager::invalidateReviews();
    }

    public function updated(Review $review): void
    {
        PerformanceCacheManager::invalidateReviews();
    }

    public function deleted(Review $review): void
    {
        PerformanceCacheManager::invalidateReviews();
    }
}
