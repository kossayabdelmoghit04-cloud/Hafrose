<?php

namespace App\Rules;

use App\Support\Location\MarketService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MoroccanCityRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! MarketService::isMoroccanCityValid($value)) {
            $fail('La ville sélectionnée n\'est pas reconnue dans le référentiel de livraison HAFROSE au Maroc.');
        }
    }
}
