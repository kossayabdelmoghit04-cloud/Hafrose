<?php

namespace App\Repositories\Eloquent;

use App\Models\Setting;
use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

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
     * Mettre à jour plusieurs paramètres en une fois (transactionnel).
     */
    public function updateMultiple(array $settings): void
    {
        DB::transaction(function () use ($settings) {
            foreach ($settings as $key => $value) {
                $this->updateOrCreate($key, $value);
            }
        });
    }
}
