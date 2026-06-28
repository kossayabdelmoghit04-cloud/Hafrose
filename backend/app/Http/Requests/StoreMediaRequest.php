<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|image|mimes:jpeg,png,jpg,webp,svg|max:10240', // jusqu'à 10 Mo pour des images HD
        ];
    }

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
