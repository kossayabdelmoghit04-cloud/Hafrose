<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAddress>
 */
class UserAddressFactory extends Factory
{
    protected $model = UserAddress::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'title'       => $this->faker->randomElement(['Domicile', 'Bureau', 'Livraison']),
            'name'        => $this->faker->name(),
            'address'     => $this->faker->streetAddress(),
            'city'        => $this->faker->city(),
            'postal_code' => $this->faker->postcode(),
            'country'     => 'France',
            'phone'       => $this->faker->phoneNumber(),
            'is_default'  => false,
        ];
    }
}
