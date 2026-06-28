<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreContactRequest extends FormRequest
{
    /**
     * Autoriser cette requête (API publique).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour l'envoi d'un message de contact.
     */
    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
            // Champ honeypot anti-spam : doit être vide
            'website' => 'nullable|max:0',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'name.required'    => 'Le nom est obligatoire.',
            'email.required'   => 'L\'email est obligatoire.',
            'email.email'      => 'L\'email doit être une adresse valide.',
            'subject.required' => 'Le sujet est obligatoire.',
            'message.required' => 'Le message est obligatoire.',
            'message.min'      => 'Le message doit contenir au moins 10 caractères.',
            'website.max'      => 'Détection de spam.',
        ];
    }

    /**
     * Gérer l'échec de la validation en retournant un JSON uniforme.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors'  => $validator->errors(),
            'data'    => null,
        ], 422));
    }
}
