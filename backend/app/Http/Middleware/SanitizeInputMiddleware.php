<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * HAFROSE Input Sanitizer Middleware (Phase 6.5 Enterprise Security)
 *
 * Recursively cleans incoming request strings to prevent XSS payloads,
 * null byte injection, and malicious control characters across all API requests.
 */
class SanitizeInputMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isJson() || $request->is('api/*')) {
            $input = $request->all();
            $sanitizedInput = $this->sanitizeArray($input);
            $request->merge($sanitizedInput);
        }

        return $next($request);
    }

    /**
     * Recursively sanitize array data
     */
    private function sanitizeArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value);
            } elseif (is_string($value)) {
                $data[$key] = $this->sanitizeString($value);
            }
        }
        return $data;
    }

    /**
     * Sanitize a single string value
     */
    private function sanitizeString(string $value): string
    {
        // 1. Remove Null Bytes
        $value = str_replace(chr(0), '', $value);

        // 2. Trim whitespace
        $value = trim($value);

        // 3. Strip dangerous script tags while keeping raw safe text
        // (Note: HTML encoding is done on output rendering or safe validation)
        $value = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $value);

        // 4. Remove javascript: pseudo-protocol URIs
        $value = preg_replace('/javascript:[^\s]*/i', '', $value);

        return $value;
    }
}
