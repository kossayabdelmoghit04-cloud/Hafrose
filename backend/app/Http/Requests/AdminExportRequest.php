<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string'],
            'sort_by' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc,ASC,DESC'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status' => ['nullable', 'string', 'max:50'],
            'is_approved' => ['nullable', 'boolean'],
            'is_read' => ['nullable', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
