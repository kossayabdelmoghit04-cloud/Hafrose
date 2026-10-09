<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $resource = strtolower((string) $this->route('resource'));
        $allowedSorts = match ($resource) {
            'products', 'product' => ['id', 'name', 'price', 'stock', 'created_at'],
            'categories', 'category' => ['id', 'name', 'created_at'],
            'orders', 'order' => ['id', 'created_at', 'total_price', 'status'],
            'reviews', 'review' => ['id', 'rating', 'created_at', 'is_approved'],
            'contacts', 'contact' => ['id', 'name', 'email', 'created_at', 'is_read'],
            'users', 'user' => ['id', 'name', 'email', 'created_at', 'role'],
            default => ['created_at'],
        };

        return [
            'search' => ['nullable', 'string', 'max:255'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string'],
            'sort_by' => ['nullable', 'string', Rule::in($allowedSorts)],
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
