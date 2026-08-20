@php
    $status = 500;
    $title = 'Something Went Wrong';
    $message = $message ?? 'An unexpected error occurred. Our team has been notified and we are working to fix it.';
@endphp

@include('errors.partials.error', [
    'status' => $status,
    'title' => $title,
    'message' => $message,
])