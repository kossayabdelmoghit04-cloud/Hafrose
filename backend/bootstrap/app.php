<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'honeypot' => \App\Http\Middleware\BlockSpamHoneypot::class,
            'turnstile' => \App\Http\Middleware\VerifyTurnstileToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = 500;
                $message = $e->getMessage() ?: 'Server Error';
                $errors = null;
                $data = null;

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $status = 422;
                    $message = 'Validation failed';
                    $errors = $e->errors();
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException || 
                           $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $status = 404;
                    $message = 'Resource not found';
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                    $message = 'Unauthenticated';
                } elseif ($e instanceof \Illuminate\Auth\AccessDeniedException || 
                           $e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                    $status = 403;
                    $message = 'Forbidden';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
                    $status = 405;
                    $message = 'Method not allowed';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\ThrottleRequestsException ||
                           $e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException ||
                           (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 429)) {
                    $status = 429;
                    $message = 'Too many requests';
                } elseif ($e instanceof \Illuminate\Database\QueryException && $e->getCode() == 23000) {
                    $status = 409;
                    $message = 'Conflict detected';
                }

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'errors' => $errors,
                    'data' => $data
                ], $status);
            }
        });
    })->create();
