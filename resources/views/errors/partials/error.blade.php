<!DOCTYPE html>
<html @class(['dark' => ($appearance ?? 'system') == 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Error' }} - {{ config('app.name', 'Amar Batch') }}</title>

    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';
            if (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>

    <style>
        html { background-color: oklch(0.985 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    <link rel="icon" href="/favicon.ico?v=2" sizes="any">

    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased">
    <div class="flex min-h-screen flex-col items-center justify-center p-6">
        <div class="w-full max-w-sm">
            <div class="text-center">
                <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                    <svg class="size-10 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                <p class="text-sm font-medium text-muted-foreground">{{ $status }}</p>
                <h1 class="mt-2 text-2xl font-semibold tracking-tight">{{ $title }}</h1>
                <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ $message }}</p>
            </div>
            <div class="mt-8 flex flex-col gap-2.5">
                <a
                    href="{{ $dashboardUrl ?? url('/dashboard') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    {{ $buttonText ?? 'Back to Dashboard' }}
                </a>
                <a
                    href="{{ url('/') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                    {{ __('Go Home') }}
                </a>
            </div>
            @if (! empty($actionUrl))
                <div class="mt-6 text-center">
                    <a href="{{ $actionUrl }}" class="text-sm text-muted-foreground underline-offset-4 hover:underline">
                        {{ $actionText ?? '' }}
                    </a>
                </div>
            @endif
        </div>
    </div>
</body>
</html>
