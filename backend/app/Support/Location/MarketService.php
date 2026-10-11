<?php

namespace App\Support\Location;

class MarketService
{
    /**
     * Get default canonical market country name.
     */
    public static function getDefaultCountry(): string
    {
        return config('markets.default_country', 'Maroc');
    }

    /**
     * Determine if a country is supported by HAFROSE.
     */
    public static function isCountryAllowed(?string $country): bool
    {
        if ($country === null || trim($country) === '') {
            return true; // Will fallback to default country
        }

        $allowed = config('markets.allowed_countries', ['Maroc', 'Morocco', 'MA']);
        $normalizedInput = self::normalizeString($country);

        foreach ($allowed as $allowedCountry) {
            if (self::normalizeString($allowedCountry) === $normalizedInput) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalize country to canonical Moroccan name if valid.
     */
    public static function canonicalCountry(?string $country): string
    {
        if ($country === null || trim($country) === '') {
            return self::getDefaultCountry();
        }

        if (self::isCountryAllowed($country)) {
            return 'Maroc';
        }

        return $country;
    }

    /**
     * Get list of official Moroccan cities.
     */
    public static function getMoroccanCities(): array
    {
        return config('markets.moroccan_cities', []);
    }

    /**
     * Validate if a given city is an authorized Moroccan city (accent & case-insensitive).
     */
    public static function isMoroccanCityValid(?string $city): bool
    {
        if ($city === null || trim($city) === '') {
            return false;
        }

        $normalizedInput = self::normalizeString($city);
        $cities = self::getMoroccanCities();

        foreach ($cities as $moroccanCity) {
            if (self::normalizeString($moroccanCity) === $normalizedInput) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return canonical formatted city name if matched, or trimmed input.
     */
    public static function canonicalCity(string $city): string
    {
        $normalizedInput = self::normalizeString($city);
        $cities = self::getMoroccanCities();

        foreach ($cities as $moroccanCity) {
            if (self::normalizeString($moroccanCity) === $normalizedInput) {
                return $moroccanCity;
            }
        }

        return trim($city);
    }

    /**
     * Helper to normalize string for accent/case insensitive comparison.
     */
    private static function normalizeString(string $value): string
    {
        $clean = mb_strtolower(trim($value), 'UTF-8');
        // Transliterate accents: é -> e, è -> e, ê -> e, etc.
        $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $clean);
        if ($transliterated !== false) {
            $clean = $transliterated;
        }
        return preg_replace('/[^a-z0-9]/', '', $clean) ?? '';
    }
}
