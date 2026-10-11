<?php

namespace App\Rules;

use App\Support\Location\MarketService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AllowedCountryRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! MarketService::isCountryAllowed($value)) {
            $fail('Le pays sélectionné n\'est pas desservi par la Maison HAFROSE. Seul le Maroc est actuellement autorisé.');
        }
    }
}
