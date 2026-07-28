<?php

namespace App\Services;

use App\Models\SecurityAuditLog;
use App\Models\TwoFactorCredential;
use App\Models\User;
use Illuminate\Support\Str;

class SecurityService
{
    public function logAction(?int $userId, string $action, string $ip, ?string $userAgent = null, array $details = []): SecurityAuditLog
    {
        return SecurityAuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'details' => $details,
        ]);
    }

    public function generate2FaSecret(User $user): array
    {
        $secret = strtoupper(Str::random(16));
        $recoveryCodes = [
            Str::random(10), Str::random(10), Str::random(10), Str::random(10),
        ];

        TwoFactorCredential::updateOrCreate(
            ['user_id' => $user->id],
            [
                'secret' => $secret,
                'is_enabled' => false,
                'recovery_codes' => $recoveryCodes,
            ]
        );

        return [
            'secret' => $secret,
            'qr_code_url' => "otpauth://totp/HAFROSE:{$user->email}?secret={$secret}&issuer=HAFROSE",
            'recovery_codes' => $recoveryCodes,
        ];
    }
}
