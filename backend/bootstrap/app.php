<?php

use App\Exceptions\InsufficientStockException;
use App\Exceptions\ProductNotFoundException;
use App\Http\Middleware\BlockSpamHoneypot;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\MonitoringMiddleware;
use App\Http\Middleware\PerformanceMonitoringMiddleware;
use App\Http\Middleware\SanitizeInputMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;
use App\Http\Middleware\VerifyTurnstileToken;
use Illuminate\Auth\AccessDeniedException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'admin' => EnsureUserIsAdmin::class,
            'honeypot' => BlockSpamHoneypot::class,
            'turnstile' => VerifyTurnstileToken::class,
            'perf.monitor' => PerformanceMonitoringMiddleware::class,
            'monitoring' => MonitoringMiddleware::class,
            'sanitize.input' => SanitizeInputMiddleware::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*')) {
                return null;
            }

            return '/login';
        });

        $middleware->api(append: [
            SanitizeInputMiddleware::class,
            MonitoringMiddleware::class,
            SecurityHeadersMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = 500;
                $isProduction = config('app.env') === 'production';
                $message = ($isProduction && ! ($e instanceof ValidationException))
                    ? 'Le serveur MAISON HAFROSE rencontre une indisponibilité temporaire.'
                    : ($e->getMessage() ?: 'Server Error');

                $errors = null;
                $data = null;

                if ($e instanceof ValidationException) {
                    $status = 422;
                    $message = 'Validation failed';
                    $errors = $e->errors();
                } elseif ($e instanceof InsufficientStockException) {
                    $status = 409;
                    $message = $e->getMessage();
                    $errors = ['stock' => ["Le stock disponible est de {$e->availableStock} unité(s)."]];
                } elseif ($e instanceof ProductNotFoundException) {
                    $status = 404;
                    $message = 'Product not found';
                    $errors = ['product_id' => [$e->getMessage()]];
                } elseif ($e instanceof NotFoundHttpException ||
                           $e instanceof ModelNotFoundException) {
                    $status = 404;
                    $message = 'Resource not found';
                } elseif ($e instanceof AuthenticationException) {
                    $status = 401;
                    $message = 'Unauthenticated';
                } elseif ($e instanceof AccessDeniedException ||
                           $e instanceof AccessDeniedHttpException) {
                    $status = 403;
                    $message = 'Forbidden';
                } elseif ($e instanceof MethodNotAllowedHttpException) {
                    $status = 405;
                    $message = 'Method not allowed';
                } elseif ($e instanceof Symfony\Component\HttpKernel\Exception\ThrottleRequestsException ||
                           $e instanceof ThrottleRequestsException ||
                           (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 429)) {
                    $status = 429;
                    $message = 'Too many requests';
                } elseif ($e instanceof QueryException && $e->getCode() == 23000) {
                    $status = 409;
                    $message = 'Conflict detected';
                }

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'errors' => $errors,
                    'data' => $data,
                ], $status);
            }
        });
    })->create();
