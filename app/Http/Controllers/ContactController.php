<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageNotification;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::create($validated);

        Mail::to(config('contact.to_email'))
            ->send(new ContactMessageNotification($message));

        return back()->with('success', 'Your message has been sent. We will get back to you soon.');
    }
}