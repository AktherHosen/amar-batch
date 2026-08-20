@component('mail::message')
# Hello {{ $message->name }},

Thank you for contacting us. Here is our response:

<div style="padding: 1rem; background-color: #f4f4f5; border-radius: 0.5rem; margin: 1rem 0;">
{{ $message->reply }}
</div>

**Your original message:**
> {{ $message->message }}

If you have any further questions, feel free to reply to this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent