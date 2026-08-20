<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageReply extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $message) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [new Address($this->message->email, $this->message->name)],
            from: new Address(config('contact.reply_from'), config('app.name')),
            subject: "Re: {$this->message->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-message-reply',
        );
    }
}