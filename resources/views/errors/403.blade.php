@php
    $status = 403;
    $title = 'অননুমোদিত';
    $message = $message ?? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই। মনে করলে এটি একটি ভুল, তাহলে প্রশাসকের সাথে যোগাযোগ করুন।';
    $buttonText = 'ড্যাশবোর্ডে ফিরে যান';
@endphp

@include('errors.partials.error', [
    'status' => $status,
    'title' => $title,
    'message' => $message,
    'buttonText' => $buttonText,
])
