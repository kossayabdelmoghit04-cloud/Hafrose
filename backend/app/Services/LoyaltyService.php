<?php

namespace App\Services;

use App\Models\LoyaltyAccount;
use App\Models\LoyaltyReward;
use App\Models\User;

class LoyaltyService
{
    /**
     * Obtenir ou initialiser le compte de fidélité de l'utilisateur.
     */
    public function getAccount(User $user): LoyaltyAccount
    {
        return LoyaltyAccount::firstOrCreate(
            ['user_id' => $user->id],
            [
                'points_balance' => 150, // bonus d'inscription par défaut
                'lifetime_points' => 150,
                'tier' => 'Bronze',
            ]
        );
    }

    /**
     * Calculer et mettre à jour le statut VIP Tier.
     */
    public function updateTier(LoyaltyAccount $account): void
    {
        $points = $account->lifetime_points;
        if ($points >= 5000) {
            $account->tier = 'Platinum';
        } elseif ($points >= 2000) {
            $account->tier = 'Gold';
        } elseif ($points >= 500) {
            $account->tier = 'Silver';
        } else {
            $account->tier = 'Bronze';
        }
        $account->save();
    }

    /**
     * Obtenir la liste des récompenses disponibles.
     */
    public function getAvailableRewards()
    {
        return LoyaltyReward::where('active', true)->get();
    }
}
