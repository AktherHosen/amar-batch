<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Contact Recipient
    |--------------------------------------------------------------------------
    |
    | The email address that receives contact form submissions. Configure it
    | via the CONTACT_MAIL_TO environment variable (falls back to a sensible
    | default when unset).
    |
    */

    'to_email' => env('CONTACT_MAIL_TO', 'support@amarbatch.com'),

    /*
    |--------------------------------------------------------------------------
    | Reply From Address
    |--------------------------------------------------------------------------
    |
    | The address used in the From header when an admin replies to a contact
    | message. Defaults to the global MAIL_FROM_ADDRESS when not provided.
    |
    */

    'reply_from' => env('CONTACT_REPLY_FROM', env('MAIL_FROM_ADDRESS', 'noreply@amarbatch.com')),

];