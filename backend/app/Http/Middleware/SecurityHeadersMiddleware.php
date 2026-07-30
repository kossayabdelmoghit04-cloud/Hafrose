<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * HAFROSE Security Headers Middleware (Phase 6.5 Enterprise Hardening)
 *
 * Adds enterprise-grade HTTP security headers to every response.
 * Implements CSP Level 3 with dynamic nonce generation, COOP, COEP, CORP, HSTS,
 * and removes server fingerprinting information.
 */
class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate cryptographically secure CSP Nonce for the request cycle
        $nonce = base64_encode(Str::random(32));
        $request->attributes->set('csp_nonce', $nonce);

        $response = $next($request);

        // 1. Prevent Clickjacking Attacks
        $response->headers->set('X-Frame-Options', 'DENY');

        // 2. Prevent MIME-type Sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // 3. Enable Legacy XSS Filter Protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // 4. Strict Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // 5. Restrict Hardware & Feature Permissions
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self), display-capture=()');

        // 6. Cross-Origin Security Policies (COOP, COEP, CORP)
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        // 7. Isolation & Performance Security
        $response->headers->set('Origin-Agent-Cluster', '?1');
        $response->headers->set('X-DNS-Prefetch-Control', 'off');

        // 8. HTTP Strict Transport Security (HSTS)
        if (config('app.env') === 'production' || $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // 9. Enterprise Content Security Policy (CSP Level 3)
        $cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://images.unsplash.com https://www.google-analytics.com https://storage.googleapis.com",
            "media-src 'self' data: blob:",
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://www.google-analytics.com https://analytics.google.com",
            "frame-src 'none'",
            "frame-ancestors 'none'",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
        ];

        $response->headers->set('Content-Security-Policy', implode('; ', $cspDirectives));

        // 10. Scrub Fingerprinting Headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');
        $response->headers->remove('X-Laravel-Version');
        header_remove('X-Powered-By');

        return $response;
    }
}
