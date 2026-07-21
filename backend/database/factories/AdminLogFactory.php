<?php

namespace Database\Factories;

use App\Models\AdminLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdminLog>
 */
class AdminLogFactory extends Factory
{
    protected $model = AdminLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'admin_id'    => User::factory(),
            'action'      => $this->faker->randomElement([
                AdminLog::ACTION_CREATE,
                AdminLog::ACTION_UPDATE,
                AdminLog::ACTION_DELETE,
                AdminLog::ACTION_STATUS_CHANGE,
            ]),
            'resource'    => $this->faker->randomElement([
                AdminLog::RESOURCE_PRODUCT,
                AdminLog::RESOURCE_CATEGORY,
                AdminLog::RESOURCE_ORDER,
                AdminLog::RESOURCE_REVIEW,
            ]),
            'resource_id' => $this->faker->randomNumber(3),
            'description' => $this->faker->sentence(),
            'old_values'  => ['status' => 'pending'],
            'new_values'  => ['status' => 'confirmed'],
            'ip_address'  => $this->faker->ipv4(),
            'user_agent'  => $this->faker->userAgent(),
            'url'         => 'http://localhost/api/admin/test',
            'method'      => $this->faker->randomElement(['GET', 'POST', 'PATCH', 'DELETE']),
        ];
    }
}
