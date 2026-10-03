<?php

namespace App\Logging;

use Monolog\Logger;
use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

/**
 * SanitizeContextProcessor — Monolog 3 Processor pour HAFROSE.
 *
 * Assure la rédaction et le masquage automatique des données sensibles
 * (mots de passe, tokens Sanctum, APP_KEY, secrets .env, données bancaires, en-têtes d'autorisation)
 * dans les messages, contextes et métadonnées avant écriture sur disque.
 */
class SanitizeContextProcessor implements ProcessorInterface
{
    /**
     * Liste des clés sensibles à masquer systématiquement.
     *
     * @var array<string>
     */
    protected const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'secret',
        'token',
        'access_token',
        'refresh_token',
        'bearer',
        'authorization',
        'api_key',
        'apikey',
        'app_key',
        'private_key',
        'db_password',
        'card_number',
        'cardnumber',
        'cvv',
        'cvc',
        'credit_card',
        'cookie',
        'turnstile_secret_key',
        'turnstile_secret',
    ];

    /**
     * Traiter et assainir l'enregistrement de log ou s'enregistrer comme Tap Monolog.
     */
    public function __invoke(mixed $recordOrLogger): mixed
    {
        // 1. Utilisation comme Tap Laravel sur le Logger
        if ($recordOrLogger instanceof \Illuminate\Log\Logger) {
            $underlying = $recordOrLogger->getLogger();
            if ($underlying instanceof Logger) {
                $underlying->pushProcessor($this);
            }

            return $recordOrLogger;
        }

        if ($recordOrLogger instanceof Logger) {
            $recordOrLogger->pushProcessor($this);

            return $recordOrLogger;
        }

        // 2. Utilisation comme Processeur Monolog sur chaque LogRecord
        if ($recordOrLogger instanceof LogRecord) {
            $sanitizedMessage = $this->sanitizeString($recordOrLogger->message);
            $sanitizedContext = $this->sanitizeData($recordOrLogger->context);
            $sanitizedExtra = $this->sanitizeData($recordOrLogger->extra);

            return $recordOrLogger->with(
                message: $sanitizedMessage,
                context: $sanitizedContext,
                extra: $sanitizedExtra
            );
        }

        return $recordOrLogger;
    }

    /**
     * Assainir récursivement un tableau de données.
     */
    public function sanitizeData(mixed $data): mixed
    {
        if (is_array($data)) {
            $sanitized = [];
            foreach ($data as $key => $value) {
                if ($this->isSensitiveKey((string) $key)) {
                    $sanitized[$key] = '[REDACTED]';
                } else {
                    $sanitized[$key] = $this->sanitizeData($value);
                }
            }

            return $sanitized;
        }

        if (is_string($data)) {
            return $this->sanitizeString($data);
        }

        return $data;
    }

    /**
     * Déterminer si une clé correspond à un champ sensible.
     */
    protected function isSensitiveKey(string $key): bool
    {
        $normalized = strtolower(trim($key));

        foreach (self::SENSITIVE_KEYS as $sensitive) {
            if ($normalized === $sensitive || str_contains($normalized, $sensitive)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Masquer les motifs sensibles connus au sein d'une chaîne de texte.
     */
    public function sanitizeString(string $text): string
    {
        // 1. Masquer les en-têtes Authorization Bearer
        $text = preg_replace('/Bearer\s+[A-Za-z0-9\-_=.]+/i', 'Bearer [REDACTED]', $text);

        // 2. Masquer les tokens Sanctum (ex: 442|GshHwgQawjeF3eC4I3xVTjfdhGAECVMfoCOmcID4306dc69d)
        $text = preg_replace('/\b\d+\|[A-Za-z0-9]{30,}\b/', '[REDACTED_SANCTUM_TOKEN]', $text);

        // 3. Masquer les APP_KEY Laravel (base64:...)
        $text = preg_replace('/\bbase64:[A-Za-z0-9+\/=]{40,}\b/', 'base64:[REDACTED_APP_KEY]', $text);

        // 4. Masquer les numéros de carte bancaire (13 à 19 chiffres consécutifs ou séparés par tirets/espaces)
        $text = preg_replace('/\b(?:\d[ -]*?){13,19}\b/', '[REDACTED_CARD]', $text);

        return $text;
    }
}
