<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ProductionCheckCommand extends Command
{
    protected $signature = 'hafrose:production-check';

    protected $description = 'Fail unless the effective configuration is safe for production.';

    public function handle(): int
    {
        $turnstileEnabled = (bool) config('turnstile.enabled', true);
        $backupEncryptionEnabled = (bool) config('production.encryption.enabled', false);
        $offsiteEnabled = (bool) config('production.offsite.enabled', false);
        $customerExpiry = (int) config('sanctum.customer_expiration', 0);
        $adminExpiry = (int) config('sanctum.admin_expiration', 0);

        $checks = [
            'APP_ENV is production' => config('app.env') === 'production',
            'APP_DEBUG is false' => config('app.debug') === false,
            'APP_KEY is configured' => ! $this->unsafe(config('app.key')),
            'APP_URL uses HTTPS' => $this->https(config('app.url')),
            'FRONTEND_URL uses HTTPS' => $this->https(config('app.frontend_url')),
            'DB_HOST is configured' => ! $this->unsafe(config('database.connections.mysql.host')),
            'DB_DATABASE is configured' => ! $this->unsafe(config('database.connections.mysql.database')),
            'DB_USERNAME is configured' => ! $this->unsafe(config('database.connections.mysql.username')),
            'DB_PASSWORD is strong/configured' => ! $this->unsafe(config('database.connections.mysql.password')),
            'MYSQL_ROOT_PASSWORD is strong/configured' => ! $this->unsafe($this->raw('MYSQL_ROOT_PASSWORD')),
            'MAIL_MAILER is not log/array' => ! in_array(config('mail.default'), ['log', 'array'], true),
            'MAIL_HOST is configured' => ! $this->unsafe(config('mail.mailers.smtp.host')),
            'MAIL_FROM_ADDRESS is configured' => ! $this->unsafe(config('mail.from.address')),
            'CORS_ALLOWED_ORIGINS is explicit' => ! $this->unsafe($this->raw('CORS_ALLOWED_ORIGINS')),
            'Sanctum expirations are coherent' => $customerExpiry > 0 && $adminExpiry > 0 && $adminExpiry <= $customerExpiry,
            'Turnstile cannot be bypassed' => ! $turnstileEnabled ? false : true,
            'TURNSTILE_SITE_KEY is configured' => ! $turnstileEnabled || ! $this->unsafe(config('turnstile.site_key')),
            'TURNSTILE_SECRET_KEY is configured' => ! $turnstileEnabled || ! $this->unsafe(config('turnstile.secret_key')),
            'BACKUP_ENCRYPTION_KEY is configured when enabled' => ! $backupEncryptionEnabled
                || ! $this->unsafe(config('production.encryption.key')),
            'OFFSITE_DISK is configured when enabled' => ! $offsiteEnabled
                || ! $this->unsafe(config('production.offsite.disk')),
        ];

        $failed = [];
        foreach ($checks as $label => $passed) {
            $this->line(sprintf('[%s] %s', $passed ? 'PASS' : 'FAIL', $label));
            if (! $passed) {
                $failed[] = $label;
            }
        }

        if ($failed !== []) {
            $this->error('Production preflight failed. Deployment is blocked.');

            return self::FAILURE;
        }

        $this->info('Production preflight passed. No external email was sent.');

        return self::SUCCESS;
    }

    private function raw(string $key): ?string
    {
        $value = getenv($key);

        return $value === false ? ($_ENV[$key] ?? $_SERVER[$key] ?? null) : $value;
    }

    private function https(mixed $value): bool
    {
        return is_string($value) && str_starts_with(strtolower($value), 'https://');
    }

    private function unsafe(mixed $value): bool
    {
        if (! is_string($value) || trim($value) === '') {
            return true;
        }

        return (bool) preg_match('/(replace|generate|change.?me|example\.invalid|rootsecret|^secret$|template)/i', trim($value));
    }
}
