@php
    $status = 419;
    $title = 'Session Expired';
    $message = $message ?? 'Your session has expired. Please refresh the page and try again.';
@endphp

@include('errors.partials.error', [
    'status' => $status,
    'title' => $title,
    'message' => $message,
    'buttonText' => 'Refresh Page',
    'actionUrl' => url()->current(),
    'actionText' => 'Try refreshing the current page',
])