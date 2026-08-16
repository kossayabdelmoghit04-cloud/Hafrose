<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\SettingService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected SettingService $settingService,
        protected AdminLogService $adminLogService,
    ) {}

    /**
     * Obtenir tous les paramètres sous forme de clé-valeur avec URLs résolues.
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingService->getFormattedSettings();

        return $this->successResponse($settings, 'Paramètres chargés avec succès.');
    }

    /**
     * Mettre à jour les paramètres globaux du site.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $oldSettings = $this->settingService->getSettings();
        $settingsData = $request->input('settings', []);

        // Si settingsData est une chaîne JSON (depuis FormData multipart), la décoder
        if (is_string($settingsData)) {
            $decoded = json_decode($settingsData, true);
            if (is_array($decoded)) {
                $settingsData = $decoded;
            }
        }

        // Récupérer également les champs plats de requête s'ils ont été envoyés individuellement
        foreach ($request->except(['settings', 'site_logo', 'site_favicon', 'hero_image', 'editorial_image', 'promo_image', '_token', '_method']) as $key => $val) {
            if (! isset($settingsData[$key])) {
                $settingsData[$key] = $val;
            }
        }

        $logo = $request->file('site_logo');
        $favicon = $request->file('site_favicon');
        $heroImage = $request->file('hero_image');
        $editorialImage = $request->file('editorial_image');
        $promoImage = $request->file('promo_image');

        $this->settingService->updateSettings(
            $settingsData,
            $logo,
            $favicon,
            $heroImage,
            $editorialImage,
            $promoImage
        );

        $newSettings = $this->settingService->getFormattedSettings();

        $this->adminLogService->log(
            request: $request,
            action: AdminLog::ACTION_UPDATE,
            resource: AdminLog::RESOURCE_SETTING,
            oldValues: is_array($oldSettings) ? $oldSettings : (array) $oldSettings,
            newValues: is_array($newSettings) ? $newSettings : (array) $newSettings,
        );

        return $this->successResponse(
            $newSettings,
            'Paramètres mis à jour avec succès.'
        );
    }
}
