<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = app('tenant_id');

        $query = Message::where('tenant_id', $tenantId)
            ->where(fn ($q) => $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id))
            ->with(['sender', 'receiver', 'student']);

        if ($request->has('filter')) {
            $filter = $request->input('filter');
            if ($filter === 'sent') {
                $query->where('sender_id', $user->id);
            } elseif ($filter === 'received') {
                $query->where('receiver_id', $user->id);
            } elseif ($filter === 'unread') {
                $query->where('receiver_id', $user->id)->whereNull('read_at');
            }
        }

        $messages = $query->latest()->paginate(15)->withQueryString();

        $unreadCount = Message::where('tenant_id', $tenantId)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $users = User::whereHas('tenants', fn ($q) => $q->where('tenants.id', $tenantId))
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $students = Student::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('messages/index', [
            'messages' => $messages,
            'unreadCount' => $unreadCount,
            'users' => $users,
            'students' => $students,
            'filter' => $request->input('filter', 'all'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'student_id' => 'nullable|exists:students,id',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
        ]);

        $tenantId = app('tenant_id');

        Message::create([
            'tenant_id' => $tenantId,
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'student_id' => $validated['student_id'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Message sent successfully.']);
    }

    public function show(Request $request, Message $message): Response
    {
        $user = $request->user();

        abort_unless(
            $message->sender_id === $user->id || $message->receiver_id === $user->id,
            403
        );

        $message->load(['sender', 'receiver', 'student']);

        if ($message->receiver_id === $user->id) {
            $message->markAsRead();
        }

        $tenantId = app('tenant_id');

        $conversation = Message::where('tenant_id', $tenantId)
            ->where(function ($q) use ($message) {
                $q->where(function ($q2) use ($message) {
                    $q2->where('sender_id', $message->sender_id)->where('receiver_id', $message->receiver_id);
                })->orWhere(function ($q2) use ($message) {
                    $q2->where('sender_id', $message->receiver_id)->where('receiver_id', $message->sender_id);
                });
            })
            ->where('student_id', $message->student_id)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at')
            ->get();

        return Inertia::render('messages/show', [
            'message' => $message,
            'conversation' => $conversation,
        ]);
    }

    public function reply(Request $request, Message $message): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $message->sender_id === $user->id || $message->receiver_id === $user->id,
            403
        );

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $receiverId = $message->sender_id === $user->id
            ? $message->receiver_id
            : $message->sender_id;

        Message::create([
            'tenant_id' => app('tenant_id'),
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'student_id' => $message->student_id,
            'subject' => $message->subject,
            'body' => $validated['body'],
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Reply sent.']);
    }

    public function markAsRead(Message $message): RedirectResponse
    {
        abort_unless($message->receiver_id === auth()->id(), 403);
        $message->markAsRead();
        return back();
    }

    public function destroy(Message $message): RedirectResponse
    {
        abort_unless(
            $message->sender_id === auth()->id() || $message->receiver_id === auth()->id(),
            403
        );

        $message->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Message deleted.']);
    }
}
