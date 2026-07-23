<?php

namespace App\Repositories\Contracts;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryInterface
{
    /**
     * Obtenir tous les paramètres.
     */
    public function all(): Collection;

    /**
     * Obtenir un paramètre par sa clé.
     */
    public function findByKey(string $key): ?Setting;

    /**
     * Mettre à jour ou créer un paramètre.
     */
    public function updateOrCreate(string $key, ?string $value): Setting;

    /**
     * Mettre à jour plusieurs paramètres en une fois (transactionnel).
     */
    public function updateMultiple(array $settings): void;
}
