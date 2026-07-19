<?php

namespace App\Repositories\Eloquent;

use App\Models\Setting;
use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB; // utilisé pour upsert() dans updateMultiple()

class SettingRepository implements SettingRepositoryInterface
{
    /**
     * Obtenir tous les paramètres.
     */
    public function all(): Collection
    {
        return Setting::all();
    }

    /**
     * Obtenir un paramètre par sa clé.
     */
    public function findByKey(string $key): ?Setting
    {
        return Setting::where('key', $key)->first();
    }

    /**
     * Mettre à jour ou créer un paramètre.
     */
    public function updateOrCreate(string $key, ?string $value): Setting
    {
        return Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Mettre à jour plusieurs paramètres en une fois.
     *
     * Utilise upsert() pour réduire les N aller-retours base de données
     * (un seul INSERT ... ON DUPLICATE KEY UPDATE) au lieu de N updateOrCreate().
     */
    public function updateMultiple(array $settings): void
    {
        if (empty($settings)) {
            return;
        }

        $now  = now();
        $rows = [];

        foreach ($settings as $key => $value) {
            $rows[] = [
                'key'        => $key,
                'value'      => $value,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('settings')->upsert(
            $rows,
            ['key'],                    // colonne unique de correspondance
            ['value', 'updated_at']     // colonnes à mettre à jour si la ligne existe
        );
    }
}
