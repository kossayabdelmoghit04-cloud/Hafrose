<?php

namespace Tests\Feature;

use Tests\TestCase;

class MC07C1CorsProductionTest extends TestCase
{
    public function test_production_defaults_allow_official_origins_and_reject_localhost(): void
    {
        $oldEnvironment = config('app.env');
        config(['app.env' => 'production']);
        $config = require config_path('cors.php');

        $this->assertContains('https://hafrose.com', $config['allowed_origins']);
        $this->assertNotContains('http://localhost:3000', $config['allowed_origins']);
        $this->assertNotContains('https://evil.example', $config['allowed_origins']);
        $this->assertFalse($config['supports_credentials']);

        config(['app.env' => $oldEnvironment]);
    }
}
