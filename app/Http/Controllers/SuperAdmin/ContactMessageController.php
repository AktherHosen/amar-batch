<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageReply;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ContactMessage::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status === 'unread') {
            $query->unread();
        }

        $messages = $query->latest()->paginate(10)->withQueryString();

        $stats = [
            'total' => ContactMessage::count(),
            'unread' => ContactMessage::unread()->count(),
            'replied' => ContactMessage::whereNotNull('replied_at')->count(),
        ];

        return Inertia::render('super-admin/contacts/index', [
            'messages' => $messages,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function reply(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:5000'],
        ]);

        $contactMessage->update([
            'reply' => $validated['reply'],
            'replied_at' => now(),
            'is_read' => true,
        ]);

        Mail::to($contactMessage->email, $contactMessage->name)
            ->send(new ContactMessageReply($contactMessage));

        return back()->with('success', 'Reply sent to ' . $contactMessage->email);
    }

    public function markRead(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->markRead();

        return back()->with('success', 'Message marked as read.');
    }
}