@php
    $status = 404;
    $title = 'Page Not Found';
    $message = $message ?? 'The page you are looking for does not exist or may have been moved.';
@endphp

@include('errors.partials.error', [
    'status' => $status,
    'title' => $title,
    'message' => $message,
])