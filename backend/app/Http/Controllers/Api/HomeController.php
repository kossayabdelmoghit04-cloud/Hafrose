<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected SettingService $settingService
    ) {}

    /**
     * Obtenir toutes les données dynamiques de la page d'accueil (Hero, Éditorial, Bannière, Paramètres).
     *
     * GET /api/home
     */
    public function index(): JsonResponse
    {
        $homeData = $this->settingService->getHomeData();

        return $this->successResponse($homeData, 'Données de la page d\'accueil récupérées avec succès.');
    }

    /**
     * Obtenir les paramètres publics du site.
     *
     * GET /api/settings
     */
    public function settings(): JsonResponse
    {
        $settings = $this->settingService->getFormattedSettings();

        return $this->successResponse($settings, 'Paramètres du site récupérés avec succès.');
    }
}
