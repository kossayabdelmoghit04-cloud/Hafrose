<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    use HasJsonValidation;

    /**
     * Autoriser cette requête (réservée aux administrateurs via middleware).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la mise à jour des paramètres du site.
     */
    public function rules(): array
    {
        return [
            'settings'                   => 'required|array',
            'settings.site_name'         => 'required|string|max:255',
            'settings.address'           => 'nullable|string|max:500',
            'settings.phone'             => 'nullable|string|max:100',
            'settings.email'             => 'nullable|email|max:255',
            'settings.facebook'          => 'nullable|string|max:255',
            'settings.instagram'         => 'nullable|string|max:255',
            'settings.whatsapp'          => 'nullable|string|max:100',
            'settings.hours'             => 'nullable|string|max:500',
            'settings.meta_title'        => 'nullable|string|max:255',
            'settings.meta_description'  => 'nullable|string|max:500',
            'site_logo'                  => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'site_favicon'               => 'nullable|image|mimes:jpeg,png,jpg,webp,svg,ico|max:2048',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'settings.required'              => 'Les paramètres sont requis.',
            'settings.array'                 => 'Les paramètres doivent être fournis sous forme d\'objet.',
            'settings.site_name.required'    => 'Le nom du site est obligatoire.',
            'settings.site_name.max'         => 'Le nom du site ne doit pas dépasser 255 caractères.',
            'settings.address.max'           => 'L\'adresse ne doit pas dépasser 500 caractères.',
            'settings.phone.max'             => 'Le numéro de téléphone ne doit pas dépasser 100 caractères.',
            'settings.email.email'           => 'L\'adresse email de contact doit être valide.',
            'settings.email.max'             => 'L\'adresse email ne doit pas dépasser 255 caractères.',
            'settings.facebook.max'          => 'L\'URL Facebook ne doit pas dépasser 255 caractères.',
            'settings.instagram.max'         => 'L\'URL Instagram ne doit pas dépasser 255 caractères.',
            'settings.whatsapp.max'          => 'Le numéro WhatsApp ne doit pas dépasser 100 caractères.',
            'settings.meta_title.max'        => 'Le titre méta ne doit pas dépasser 255 caractères.',
            'settings.meta_description.max'  => 'La description méta ne doit pas dépasser 500 caractères.',
            'site_logo.image'                => 'Le logo doit être une image valide.',
            'site_logo.mimes'                => 'Le logo doit être au format JPEG, PNG, JPG, WEBP ou SVG.',
            'site_logo.max'                  => 'Le logo ne doit pas dépasser 5 Mo.',
            'site_favicon.image'             => 'Le favicon doit être une image valide.',
            'site_favicon.mimes'             => 'Le favicon doit être au format JPEG, PNG, JPG, WEBP, SVG ou ICO.',
            'site_favicon.max'               => 'Le favicon ne doit pas dépasser 2 Mo.',
        ];
    }
}
