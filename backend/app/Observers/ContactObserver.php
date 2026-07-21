<?php

namespace App\Observers;

use App\Models\Contact;
use App\Services\PerformanceCacheManager;

class ContactObserver
{
    public function created(Contact $contact): void
    {
        PerformanceCacheManager::invalidateContacts();
    }

    public function updated(Contact $contact): void
    {
        PerformanceCacheManager::invalidateContacts();
    }

    public function deleted(Contact $contact): void
    {
        PerformanceCacheManager::invalidateContacts();
    }
}
