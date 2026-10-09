<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class GiftCardCheckRequest extends FormRequest
{
    use HasJsonValidation;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9-]+$/'],
        ];
    }
}
