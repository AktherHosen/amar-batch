@php
    $status = 403;
    $title = 'Forbidden';
    $message = $message ?? 'You do not have permission to access this page. If you believe this is a mistake, please contact your administrator.';
@endphp

@include('errors.partials.error', [
    'status' => $status,
    'title' => $title,
    'message' => $message,
])