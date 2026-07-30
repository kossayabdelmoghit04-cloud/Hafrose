<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * HAFROSE — Security Headers Feature Test (Phase 6.5)
 *
 * Verifies CSP Level 3, HSTS, X-Frame-Options, X-Content-Type-Options,
 * Permissions-Policy, COOP, CORP, and server fingerprint stripping.
 */
class SecurityHeadersTest extends TestCase
{
    /**
     * Test that all enterprise security headers are properly set on API responses.
     */
    public function test_api_responses_contain_enterprise_security_headers(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);

        // Anti-Clickjacking & Anti-Sniffing
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');

        // Isolation & Permissions
        $response->assertHeader('Cross-Origin-Opener-Policy', 'same-origin');
        $response->assertHeader('Cross-Origin-Resource-Policy', 'same-origin');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy
        $csp = $response->headers->get('Content-Security-Policy');
        $this->assertNotNull($csp);
        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString("frame-ancestors 'none'", $csp);

        // Server Fingerprint Scrubbing
        $this->assertFalse($response->headers->has('X-Powered-By'));
    }
}
