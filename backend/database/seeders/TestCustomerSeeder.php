<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * TestCustomerSeeder — Seeds canonical E2E test customer accounts.
 *
 * These accounts are required by the Playwright E2E test suite.
 * They are created idempotently (firstOrCreate) so running this seeder
 * multiple times is safe.
 */
class TestCustomerSeeder extends Seeder
{
    /**
     * Canonical E2E test customers.
     */
    private const TEST_CUSTOMERS = [
        [
            'email'      => 'client.test@hafrose.com',
            'name'       => 'Client Test',
            'first_name' => 'Client',
            'last_name'  => 'Test',
            'password'   => 'password',
            'phone'      => '0600000001',
        ],
        [
            'email'      => 'client@hafrose.com',
            'name'       => 'Sophie Laurent',
            'first_name' => 'Sophie',
            'last_name'  => 'Laurent',
            'password'   => 'Secret123!',
            'phone'      => '0600000002',
        ],
    ];

    public function run(): void
    {
        foreach (self::TEST_CUSTOMERS as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'       => $data['name'],
                    'first_name' => $data['first_name'],
                    'last_name'  => $data['last_name'],
                    'email'      => $data['email'],
                    'password'   => Hash::make($data['password']),
                    'role'       => 'customer',
                    'phone'      => $data['phone'],
                ]
            );

            $this->command->info("✓ E2E customer ready: {$data['email']}");
        }
    }
}
