@component('mail::message')
# New Contact Message

A new message has been submitted through the contact form.

| | |
|---|---|
| **Name** | {{ $message->name }} |
| **Email** | {{ $message->email }} |
| **Subject** | {{ $message->subject }} |

**Message:**

{{ $message->message }}

@component('mail::button', ['url' => route('super-admin.contacts.index')])
View Messages
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent