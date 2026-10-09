<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class CustomerOrderIndexRequest extends FormRequest
{
    use HasJsonValidation;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
