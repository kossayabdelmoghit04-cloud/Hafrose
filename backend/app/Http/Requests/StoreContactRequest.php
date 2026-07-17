<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    use HasJsonValidation;

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
            // Le champ honeypot est intercepté en amont par le middleware BlockSpamHoneypot.
            // Il est accepté comme nullable ici pour éviter les erreurs de validation côté légitime.
            'website' => 'nullable|string',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'name.required'    => 'Le nom est obligatoire.',
            'name.string'      => 'Le nom doit être une chaîne de caractères.',
            'name.max'         => 'Le nom ne doit pas dépasser 255 caractères.',
            'email.required'   => 'L\'email est obligatoire.',
            'email.email'      => 'L\'email doit être une adresse valide.',
            'email.max'        => 'L\'email ne doit pas dépasser 255 caractères.',
            'phone.max'        => 'Le numéro de téléphone ne doit pas dépasser 50 caractères.',
            'subject.required' => 'Le sujet est obligatoire.',
            'subject.max'      => 'Le sujet ne doit pas dépasser 255 caractères.',
            'message.required' => 'Le message est obligatoire.',
            'message.min'      => 'Le message doit contenir au moins 10 caractères.',
            'message.max'      => 'Le message ne doit pas dépasser 5000 caractères.',
        ];
    }
}
