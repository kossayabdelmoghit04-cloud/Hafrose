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

            // Définir des valeurs par défaut complètes pour le site et la page d'accueil
            $defaults = [
                'site_name' => 'HAFROSE',
                'site_logo' => null,
                'site_favicon' => null,
                'address' => '12 Boulevard de la Corniche, Casablanca',
                'phone' => '+212 600 000 000',
                'email' => 'contact@hafrose.com',
                'contact_email' => 'contact@hafrose.com',
                'facebook' => 'https://facebook.com/hafrose',
                'instagram' => 'https://instagram.com/hafrose_official',
                'whatsapp' => '+212 600 000 000',
                'hours' => 'Lun - Sam: 10h00 - 20h00',
                'currency' => 'MAD',
                'shipping_fee' => '50',
                'free_shipping_threshold' => '1000',
                'meta_title' => 'HAFROSE — Maison de Luxe | Mode Féminine',
                'meta_description' => 'Découvrez l\'univers exclusif HAFROSE — maroquinerie d\'exception, bijoux précieux et haute couture féminine.',

                // Section Hero
                'hero_eyebrow' => 'Collection Printemps — Été 2025',
                'hero_title' => "L'Art de la Féminité",
                'hero_subtitle' => 'Une symphonie d\'élégance et de raffinement',
                'hero_description' => 'Découvrez une collection pensée pour la femme moderne — alliant élégance intemporelle et féminité affirmée.',
                'hero_primary_btn_text' => 'Découvrir la Collection',
                'hero_primary_btn_url' => '/shop',
                'hero_secondary_btn_text' => 'Voir tout',
                'hero_secondary_btn_url' => '/shop',
                'hero_image' => 'hero/hero-main.png',
                'hero_is_active' => '1',

                // Collection Éditoriale
                'editorial_badge' => 'Édition Limitée',
                'editorial_title' => 'La Collection Symphonie Rose',
                'editorial_description' => 'Inspirée par la douceur de l\'aube et l\'élégance des lignes parisiennes, la collection Symphonie Rose célèbre une féminité affirmée, moderne et intemporelle.',
                'editorial_quote' => '« Chaque couture est pensée comme une œuvre d\'art, où le confort rencontre l\'extrême raffinement. »',
                'editorial_btn_text' => 'Explorer la Collection',
                'editorial_btn_url' => '/shop',
                'editorial_image' => 'banners/new-collection.jpg',
                'editorial_badge_detail_title' => 'Savoir-Faire Artisanal',
                'editorial_badge_detail_text' => 'Soie naturelle & finitions cousues main dans nos ateliers.',

                // Bannière Promotionnelle
                'promo_badge' => 'Jusqu\'au 20 Août',
                'promo_title' => 'Ventes Privées d\'Été',
                'promo_subtitle' => 'Offre Exclusive Membres',
                'promo_description' => 'Bénéficiez de jusqu\'à -30% sur une sélection exclusive de pièces de haute maroquinerie et robes de soirée.',
                'promo_btn_text' => 'Profiter de l\'Offre Privée',
                'promo_btn_url' => '/shop',
                'promo_image' => 'banners/promo-banner.jpg',
            ];

            $dbSettings = $settings->pluck('value', 'key')->toArray();

            return array_merge($defaults, $dbSettings);
        });
    }

    /**
     * Obtenir les paramètres formatés avec les URLs complètes d'images.
     */
    public function getFormattedSettings(): array
    {
        $settings = $this->getSettings();

        $imageKeys = [
            'site_logo' => 'site_logo_url',
            'site_favicon' => 'site_favicon_url',
            'hero_image' => 'hero_image_url',
            'editorial_image' => 'editorial_image_url',
            'promo_image' => 'promo_image_url',
        ];

        foreach ($imageKeys as $pathKey => $urlKey) {
            $path = $settings[$pathKey] ?? null;
            if ($path) {
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $settings[$urlKey] = $path;
                } else {
                    $clean = ltrim(str_replace('/storage/', '', $path), '/');
                    $settings[$urlKey] = Storage::url($clean);
                }
            } else {
                $settings[$urlKey] = null;
            }
        }

        return $settings;
    }

    /**
     * Obtenir la structure pour la page d'accueil publique (/api/home).
     * Les clés doivent correspondre exactement à l'interface HomeData du frontend.
     */
    public function getHomeData(): array
    {
        $settings = $this->getFormattedSettings();

        return [
            'hero' => [
                'eyebrow'              => $settings['hero_eyebrow'] ?? 'Collection Printemps — Été 2025',
                'title'                => $settings['hero_title'] ?? "L'Art de la Féminité",
                'subtitle'             => $settings['hero_subtitle'] ?? 'Une symphonie d\'élégance et de raffinement',
                'description'          => $settings['hero_description'] ?? 'Découvrez une collection pensée pour la femme moderne.',
                'primary_btn_text'     => $settings['hero_primary_btn_text'] ?? 'Découvrir la Collection',
                'primary_btn_url'      => $settings['hero_primary_btn_url'] ?? '/shop',
                'secondary_btn_text'   => $settings['hero_secondary_btn_text'] ?? 'Voir tout',
                'secondary_btn_url'    => $settings['hero_secondary_btn_url'] ?? '/shop',
                'image_url'            => $settings['hero_image_url'] ?? Storage::url('hero/hero-main.png'),
                'is_active'            => (bool) ($settings['hero_is_active'] ?? '1'),
            ],
            // Clé `editorial` — doit correspondre exactement à l'interface TypeScript HomeEditorialData
            'editorial' => [
                'badge'               => $settings['editorial_badge'] ?? 'Édition Limitée',
                'title'               => $settings['editorial_title'] ?? 'La Collection Symphonie Rose',
                'description'         => $settings['editorial_description'] ?? '',
                'quote'               => $settings['editorial_quote'] ?? '',
                'btn_text'            => $settings['editorial_btn_text'] ?? 'Explorer la Collection',
                'btn_url'             => $settings['editorial_btn_url'] ?? '/shop',
                'image_url'           => $settings['editorial_image_url'] ?? Storage::url('banners/new-collection.jpg'),
                'badge_detail_title'  => $settings['editorial_badge_detail_title'] ?? 'Savoir-Faire Artisanal',
                'badge_detail_text'   => $settings['editorial_badge_detail_text'] ?? '',
            ],
            // Clé `promo` — doit correspondre exactement à l'interface TypeScript HomePromoData
            'promo' => [
                'badge'        => $settings['promo_badge'] ?? 'Jusqu\'au 20 Août',
                'title'        => $settings['promo_title'] ?? 'Ventes Privées d\'Été',
                'subtitle'     => $settings['promo_subtitle'] ?? 'Offre Exclusive Membres',
                'description'  => $settings['promo_description'] ?? '',
                'btn_text'     => $settings['promo_btn_text'] ?? 'Profiter de l\'Offre Privée',
                'btn_url'      => $settings['promo_btn_url'] ?? '/shop',
                'image_url'    => $settings['promo_image_url'] ?? Storage::url('banners/promo-banner.jpg'),
            ],
            // Clé `site` — paramètres globaux
            'site' => [
                'name'                    => $settings['site_name'] ?? 'HAFROSE',
                'logo_url'                => $settings['site_logo_url'] ?? null,
                'favicon_url'             => $settings['site_favicon_url'] ?? null,
                'currency'                => $settings['currency'] ?? 'MAD',
                'shipping_fee'            => (float) ($settings['shipping_fee'] ?? 50),
                'free_shipping_threshold' => (float) ($settings['free_shipping_threshold'] ?? 1000),
            ],
        ];
    }

    /**
     * Mettre à jour les paramètres et invalider le cache.
     */
    public function updateSettings(
        array $settingsData,
        ?UploadedFile $logo = null,
        ?UploadedFile $favicon = null,
        ?UploadedFile $heroImage = null,
        ?UploadedFile $editorialImage = null,
        ?UploadedFile $promoImage = null
    ): void {
        $currentSettings = $this->getSettings();

        // Gérer l'upload du logo
        if ($logo) {
            $this->deletePhysicalSettingImage($currentSettings['site_logo'] ?? null);
            $logoPath = $logo->store('settings', 'public');
            $settingsData['site_logo'] = $logoPath;
        }

        // Gérer l'upload du favicon
        if ($favicon) {
            $this->deletePhysicalSettingImage($currentSettings['site_favicon'] ?? null);
            $faviconPath = $favicon->store('settings', 'public');
            $settingsData['site_favicon'] = $faviconPath;
        }

        // Gérer l'upload du Hero Image
        if ($heroImage) {
            $this->deletePhysicalSettingImage($currentSettings['hero_image'] ?? null);
            $heroPath = $heroImage->store('hero', 'public');
            $settingsData['hero_image'] = $heroPath;
        }

        // Gérer l'upload de l'image Éditoriale
        if ($editorialImage) {
            $this->deletePhysicalSettingImage($currentSettings['editorial_image'] ?? null);
            $editorialPath = $editorialImage->store('banners', 'public');
            $settingsData['editorial_image'] = $editorialPath;
        }

        // Gérer l'upload de l'image Bannière Promo
        if ($promoImage) {
            $this->deletePhysicalSettingImage($currentSettings['promo_image'] ?? null);
            $promoPath = $promoImage->store('banners', 'public');
            $settingsData['promo_image'] = $promoPath;
        }

        // Mettre à jour en base de données via le dépôt
        $this->settingRepository->updateMultiple($settingsData);

        // Invalider le cache des paramètres
        Cache::forget('site_settings');
    }

    /**
     * Supprimer un fichier physique d'image de paramètre sur le disque public.
     */
    private function deletePhysicalSettingImage(?string $path): void
    {
        if (! $path) {
            return;
        }

        $cleanPath = parse_url($path, PHP_URL_PATH) ?? $path;
        $relativePath = str_replace('/storage/', '', $cleanPath);
        $relativePath = ltrim($relativePath, '/');

        // Ne pas supprimer les fichiers par défaut protégés
        $protectedDefaults = [
            'hero/hero-main.png',
            'banners/new-collection.jpg',
            'banners/promo-banner.jpg',
        ];

        if (! in_array($relativePath, $protectedDefaults) && Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
