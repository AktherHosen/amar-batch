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
    <div class="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <div class="flex max-w-md flex-col items-center text-center">
            <div class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
                <span class="text-3xl font-bold text-muted-foreground">{{ $status }}</span>
            </div>
            <h1 class="text-2xl font-semibold tracking-tight">{{ $title }}</h1>
            <p class="mt-2 text-sm text-muted-foreground">{{ $message }}</p>
            <div class="mt-6 flex items-center gap-3">
                <a
                    href="{{ $dashboardUrl ?? url('/dashboard') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                    {{ $buttonText ?? 'Back to Dashboard' }}
                </a>
                <a
                    href="{{ url('/') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                    Go Home
                </a>
            </div>
            @if (! empty($actionUrl))
                <a href="{{ $actionUrl }}" class="mt-2 text-sm text-muted-foreground underline hover:text-foreground">
                    {{ $actionText ?? '' }}
                </a>
            @endif
        </div>
    </div>
</body>
</html>