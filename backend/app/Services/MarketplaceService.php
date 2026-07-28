<?php

namespace App\Services;

use App\Models\Seller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Str;

class MarketplaceService
{
    public function registerSeller(User $user, string $storeName): Seller
    {
        $seller = Seller::create([
            'user_id' => $user->id,
            'store_name' => $storeName,
            'slug' => Str::slug($storeName) . '-' . Str::random(4),
            'commission_rate' => 10.00,
            'is_active' => true,
        ]);

        Store::create([
            'seller_id' => $seller->id,
            'name' => $storeName,
            'bio' => 'Boutique officielle partenaire HAFROSE.',
            'rating' => 5.00,
        ]);

        return $seller;
    }

    public function getSellers()
    {
        return Seller::with('store', 'user')->get();
    }
}
