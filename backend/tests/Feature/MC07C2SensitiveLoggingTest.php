<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class MC07C2SensitiveLoggingTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET_QUERY = 'MC07_SECRET_QUERY_SENTINEL';

    private const RESET_TOKEN = 'MC07_RESET_TOKEN_SENTINEL';

    private const GIFT_CARD = 'MC07_GIFT_CARD_SENTINEL';

    private string $logPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->logPath = storage_path('logs/mc07c2-sensitive-logging.log');
        File::delete($this->logPath);

        config([
            'app.env' => 'production',
            'app.debug' => false,
            'logging.channels.mc07c2' => [
                'driver' => 'single',
                'path' => $this->logPath,
                'level' => 'debug',
            ],
            'honeypot.log_channel' => 'mc07c2',
            'turnstile.log_channel' => 'mc07c2',
        ]);
        Log::forgetChannel('mc07c2');
    }

    protected function tearDown(): void
    {
        Log::forgetChannel('mc07c2');
        File::delete($this->logPath);

        parent::tearDown();
    }

    public function test_sensitive_query_values_never_reach_file_or_database_logs(): void
    {
        $adminRequest = Request::create(
            '/api/admin/settings?reset_token='.self::RESET_TOKEN,
            'POST'
        );
        app(AdminLogService::class)->log(
            request: $adminRequest,
            action: AdminLog::ACTION_UPDATE,
            resource: AdminLog::RESOURCE_SETTING,
        );

        $adminLog = AdminLog::sole();
        $this->assertSame('/api/admin/settings', $adminLog->url);
        $this->assertSame('POST', $adminLog->method);

        config([
            'honeypot.enabled' => true,
            'honeypot.shadow_block' => true,
            'turnstile.enabled' => false,
        ]);
        $this->postJson('/api/contact?token='.self::SECRET_QUERY, [
            'website' => 'bot-filled-this-field',
        ])->assertCreated();

        $honeypotLog = ActivityLog::where(
            'event_type',
            ActivityLog::EVENT_HONEYPOT_TRIGGERED
        )->sole();
        $this->assertSame('api/contact', $honeypotLog->resource);
        $this->assertSame('/api/contact', $honeypotLog->metadata['route']);
        $this->assertSame('POST', $honeypotLog->metadata['method']);

        config([
            'honeypot.enabled' => false,
            'turnstile.enabled' => true,
        ]);
        $this->postJson('/api/contact?gift_card_code='.self::GIFT_CARD)
            ->assertUnprocessable();

        $turnstileLog = ActivityLog::where(
            'event_type',
            ActivityLog::EVENT_TURNSTILE_FAILED
        )->sole();
        $this->assertSame('/api/contact', $turnstileLog->resource);
        $this->assertSame('/api/contact', $turnstileLog->metadata['route']);

        $fileLogs = File::get($this->logPath);
        $databaseLogs = AdminLog::all()->toJson().ActivityLog::all()->toJson();

        $this->assertStringContainsString('/api/contact', $fileLogs);
        $this->assertStringContainsString('POST', $fileLogs);

        foreach ([self::SECRET_QUERY, self::RESET_TOKEN, self::GIFT_CARD] as $sentinel) {
            $this->assertStringNotContainsString($sentinel, $fileLogs);
            $this->assertStringNotContainsString($sentinel, $databaseLogs);
        }
    }
}
