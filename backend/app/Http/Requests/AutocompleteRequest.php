<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class AutocompleteRequest extends FormRequest
{
    use HasJsonValidation;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
        ];
    }
}
