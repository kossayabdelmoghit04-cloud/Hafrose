<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class MC07C1PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    private const GENERIC_MESSAGE = 'Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.';

    public function test_known_and_unknown_email_have_identical_generic_response(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        foreach ([$user->email, 'absent@example.invalid'] as $email) {
            $this->postJson('/api/auth/forgot-password', ['email' => $email])
                ->assertOk()
                ->assertJsonPath('message', self::GENERIC_MESSAGE);
        }

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_notification_targets_the_configured_frontend(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'https://shop.hafrose.example']);
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user): bool {
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, 'https://shop.hafrose.example/reset-password?')
                && str_contains($url, 'token=')
                && str_contains($url, rawurlencode($user->email));
        });
    }

    public function test_valid_token_resets_password_revokes_tokens_and_changes_login_credentials(): void
    {
        $oldPassword = 'OldPassword!123';
        $newPassword = 'NewPassword!456';
        $user = User::factory()->create(['password' => Hash::make($oldPassword), 'role' => 'customer']);
        $user->createToken('customer-token');
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ])->assertOk();

        $this->assertTrue(Hash::check($newPassword, $user->fresh()->password));
        $this->assertSame(0, $user->tokens()->count());
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => $oldPassword])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => $newPassword])->assertOk();
    }

    public function test_invalid_expired_mismatched_and_weak_resets_are_rejected(): void
    {
        $user = User::factory()->create();
        $strong = 'StrongPassword!123';

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => $strong,
            'password_confirmation' => $strong,
        ])->assertUnprocessable();

        $token = Password::createToken($user);
        DB::table('password_reset_tokens')->where('email', $user->email)->update([
            'created_at' => Carbon::now()->subHours(2),
        ]);
        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => $strong,
            'password_confirmation' => $strong,
        ])->assertUnprocessable();

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'unused',
            'password' => $strong,
            'password_confirmation' => 'DifferentPassword!123',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'unused',
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }
}
