<?php

use App\Http\Middleware\CheckTeacherApproval;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\OnboardingMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\TenantMiddleware;
use App\Http\Middleware\CheckRoutePermission;
use App\Http\Middleware\BlockSuperAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'payment/*',
        ]);

$middleware->alias([
            'role' => RoleMiddleware::class,
            'role.permission' => CheckRoutePermission::class,
            'tenant' => TenantMiddleware::class,
            'teacher.approved' => CheckTeacherApproval::class,
            'onboarding' => OnboardingMiddleware::class,
            'block.superadmin' => BlockSuperAdmin::class,
            'plan.feature' => \App\Http\Middleware\CheckPlanFeature::class,
        ]);
    })
    ->withSchedule(function ($schedule) {
        $schedule->command('subscriptions:check-expiry')->daily();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (HttpException $e, Request $request) {
            if (! $request->inertia() || $request->expectsJson() || ! $request->user()) {
                return null;
            }

            $status = $e->getStatusCode();

            $message = null;
            if ($status === 403) {
                $message = $e->getMessage();
                $defaultMessage = SymfonyResponse::$statusTexts[$status] ?? null;
                if (! $message || $message === $defaultMessage || in_array($message, ['Unauthorized.', 'This action is unauthorized.'], true)) {
                    $message = null;
                }
            }

            return Inertia::render('errors/error', [
                'status' => $status,
                'message' => $message,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
