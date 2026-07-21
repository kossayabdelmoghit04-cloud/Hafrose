<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminBulkActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'action' => [
                'required',
                'string',
                'in:delete,activate,deactivate,publish,unpublish,approve,reject,mark_read,mark_unread,status_update,archive',
            ],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'min:1'],
            'params' => ['nullable', 'array'],
            'params.status' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'action.required' => "L'action groupée est obligatoire.",
            'action.in' => "L'action demandée n'est pas reconnue ou autorisée.",
            'ids.required' => "La liste des identifiants est obligatoire.",
            'ids.min' => "Veuillez sélectionner au moins un élément.",
        ];
    }
}
