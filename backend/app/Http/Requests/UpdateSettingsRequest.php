<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings'                  => 'required|array',
            'settings.site_name'        => 'required|string|max:255',
            'settings.address'          => 'nullable|string|max:500',
            'settings.phone'            => 'nullable|string|max:100',
            'settings.email'            => 'nullable|email|max:255',
            'settings.facebook'         => 'nullable|string|max:255', // Permettre URL ou handle
            'settings.instagram'        => 'nullable|string|max:255',
            'settings.whatsapp'         => 'nullable|string|max:100',
            'settings.hours'            => 'nullable|string|max:500',
            'settings.meta_title'       => 'nullable|string|max:255',
            'settings.meta_description' => 'nullable|string|max:500',
            'site_logo'                 => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'site_favicon'              => 'nullable|image|mimes:jpeg,png,jpg,webp,svg,ico|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'settings.required'          => 'Les paramètres sont requis.',
            'settings.site_name.required'=> 'Le nom du site est obligatoire.',
            'settings.email.email'       => 'L\'adresse email de contact doit être valide.',
            'site_logo.image'            => 'Le logo doit être une image valide.',
            'site_favicon.image'         => 'Le favicon doit être une image valide.',
        ];
    }

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
