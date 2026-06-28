<?php

namespace App\Services;

use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SettingService
{
    protected SettingRepositoryInterface $settingRepository;

    public function __construct(SettingRepositoryInterface $settingRepository)
    {
        $this->settingRepository = $settingRepository;
    }

    /**
     * Obtenir tous les paramètres sous forme de tableau associatif.
     */
    public function getSettings(): array
    {
        return Cache::rememberForever('site_settings', function () {
            $settings = $this->settingRepository->all();
            
            // Définir des valeurs par défaut pour les clés importantes
            $defaults = [
                'site_name' => 'Hafrose',
                'site_logo' => null,
                'site_favicon' => null,
                'address' => '',
                'phone' => '',
                'email' => '',
                'facebook' => '',
                'instagram' => '',
                'whatsapp' => '',
                'hours' => '',
                'meta_title' => 'Hafrose - Boutique Artisanale',
                'meta_description' => 'Découvrez nos produits artisanaux uniques.',
            ];

            return array_merge($defaults, $settings->pluck('value', 'key')->toArray());
        });
    }

    /**
     * Mettre à jour les paramètres et invalider le cache.
     */
    public function updateSettings(array $settingsData, ?UploadedFile $logo = null, ?UploadedFile $favicon = null): void
    {
        $currentSettings = $this->getSettings();

        // Gérer l'upload du logo
        if ($logo) {
            // Supprimer l'ancien logo s'il existe
            if (!empty($currentSettings['site_logo'])) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $currentSettings['site_logo']));
            }
            $logoPath = $logo->store('settings', 'public');
            $settingsData['site_logo'] = Storage::url($logoPath);
        }

        // Gérer l'upload du favicon
        if ($favicon) {
            // Supprimer l'ancien favicon s'il existe
            if (!empty($currentSettings['site_favicon'])) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $currentSettings['site_favicon']));
            }
            $faviconPath = $favicon->store('settings', 'public');
            $settingsData['site_favicon'] = Storage::url($faviconPath);
        }

        // Mettre à jour en base de données via le dépôt
        $this->settingRepository->updateMultiple($settingsData);

        // Invalider le cache des paramètres
        Cache::forget('site_settings');
    }
}
