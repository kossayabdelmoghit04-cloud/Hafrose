<?php

namespace App\Services;

use App\Models\GiftCard;
use Illuminate\Support\Str;

class GiftCardService
{
    public function checkCard(string $code): ?GiftCard
    {
        return GiftCard::where('code', strtoupper(trim($code)))
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    public function createGiftCard(float $amount, string $currency = 'EUR'): GiftCard
    {
        return GiftCard::create([
            'code' => 'HAFROSE-' . strtoupper(Str::random(8)),
            'initial_balance' => $amount,
            'current_balance' => $amount,
            'currency' => $currency,
            'is_active' => true,
            'expires_at' => now()->addYear(),
        ]);
    }
}
