<?php

namespace App\Services;

class CurrencyService
{
    /**
     * Taux de conversion par rapport à la devise de référence EUR.
     */
    protected array $rates = [
        'EUR' => 1.0,
        'MAD' => 10.85,
        'USD' => 1.09,
    ];

    protected array $symbols = [
        'EUR' => '€',
        'MAD' => 'MAD',
        'USD' => '$',
    ];

    public function getCurrencies(): array
    {
        return [
            'base' => 'EUR',
            'rates' => $this->rates,
            'symbols' => $this->symbols,
        ];
    }

    public function convert(float $amountInEur, string $targetCurrency = 'EUR'): float
    {
        $targetCurrency = strtoupper($targetCurrency);
        $rate = $this->rates[$targetCurrency] ?? 1.0;

        return round($amountInEur * $rate, 2);
    }
}
