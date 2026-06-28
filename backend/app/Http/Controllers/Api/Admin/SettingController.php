<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use HttpResponses;

    protected SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Obtenir tous les paramètres sous forme de clé-valeur.
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingService->getSettings();
        return $this->successResponse($settings, 'Paramètres chargés avec succès.');
    }

    /**
     * Mettre à jour les paramètres globaux du site.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $settingsData = $request->input('settings');
        $logo = $request->file('site_logo');
        $favicon = $request->file('site_favicon');

        $this->settingService->updateSettings($settingsData, $logo, $favicon);

        return $this->successResponse(
            $this->settingService->getSettings(),
            'Paramètres mis à jour avec succès.'
        );
    }
}
