<?php

namespace App\Http\Requests;

use App\Traits\HasJsonValidation;
use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
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
     * Règles de validation pour l'upload d'un fichier media.
     */
    public function rules(): array
    {
        return [
            // Jusqu'à 10 Mo pour des images HD
            'file' => 'required|file|image|mimes:jpeg,png,jpg,webp,svg|max:10240',
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Un fichier est obligatoire.',
            'file.file'     => 'Le téléchargement doit être un fichier valide.',
            'file.image'    => 'Le fichier doit être une image.',
            'file.mimes'    => 'Formats autorisés : jpeg, png, jpg, webp, svg.',
            'file.max'      => 'Le fichier ne doit pas dépasser 10 Mo.',
        ];
    }
}
