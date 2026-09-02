<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class PhoneNumber implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // BD phone number format: starts with optional +88 or 88, then 01 followed by 3-9, and 8 digits
        if (!preg_match('/^(?:\+88|88)?01[3-9]\d{8}$/', $value)) {
            $fail('The :attribute format is invalid. Please provide a valid phone number (e.g. 01712345678).');
        }
    }
}
