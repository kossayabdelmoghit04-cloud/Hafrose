<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. S'assurer que les répertoires de stockage public existent
        $directories = ['hero', 'categories', 'banners', 'products', 'settings'];
        foreach ($directories as $dir) {
            if (! Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
            }
        }

        // 2. Synchroniser les images de démonstration si présentes dans assets/images
        $sourceAssets = public_path('assets/images');
        if (File::isDirectory($sourceAssets)) {
            $mapping = [
                'hero-main.png' => 'hero/hero-main.png',
                'new-collection.jpg' => 'banners/new-collection.jpg',
                'promo-banner.jpg' => 'banners/promo-banner.jpg',
                'category-bags.jpg' => 'categories/sacs.jpg',
                'category-dresses.jpg' => 'categories/robes.jpg',
                'category-shoes.jpg' => 'categories/chaussures.jpg',
                'category-bags.jpg' => 'categories/bijoux.jpg',
                'category-bags.jpg' => 'categories/montres.jpg',
                'category-bags.jpg' => 'categories/lunettes.jpg',
                'category-bags.jpg' => 'categories/ceintures.jpg',
                'category-bags.jpg' => 'categories/portefeuilles.jpg',
            ];

            foreach ($mapping as $srcFile => $destRel) {
                $src = $sourceAssets.DIRECTORY_SEPARATOR.$srcFile;
                if (File::exists($src)) {
                    $destFull = storage_path('app/public/'.$destRel);
                    if (! File::exists($destFull)) {
                        File::ensureDirectoryExists(dirname($destFull));
                        File::copy($src, $destFull);
                    }
                }
            }
        }

        // 3. Paramètres initiaux de la maison HAFROSE
        $settings = [
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

        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $val]
            );
        }
    }
}
