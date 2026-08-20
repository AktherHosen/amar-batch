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
        <div class="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div class="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-600/10">
                <svg class="size-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>
            <div class="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{{ $status }}</div>
            <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ $title }}</h1>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ $message }}</p>
            <div class="mt-8 flex flex-col gap-2">
                <a
                    href="{{ $dashboardUrl ?? url('/dashboard') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                    {{ $buttonText ?? 'Back to Dashboard' }}
                </a>
                <a
                    href="{{ url('/') }}"
                    class="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
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