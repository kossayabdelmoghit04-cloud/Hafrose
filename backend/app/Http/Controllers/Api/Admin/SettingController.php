<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\SettingService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected SettingService   $settingService,
        protected AdminLogService  $adminLogService,
    ) {}

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
        $oldSettings  = $this->settingService->getSettings();
        $settingsData = $request->input('settings');
        $logo         = $request->file('site_logo');
        $favicon      = $request->file('site_favicon');

        $this->settingService->updateSettings($settingsData, $logo, $favicon);
        $newSettings = $this->settingService->getSettings();

        $this->adminLogService->log(
            request:   $request,
            action:    AdminLog::ACTION_UPDATE,
            resource:  AdminLog::RESOURCE_SETTING,
            oldValues: is_array($oldSettings) ? $oldSettings : $oldSettings->toArray(),
            newValues: is_array($newSettings) ? $newSettings : $newSettings->toArray(),
        );

        return $this->successResponse(
            $newSettings,
            'Paramètres mis à jour avec succès.'
        );
    }
}
