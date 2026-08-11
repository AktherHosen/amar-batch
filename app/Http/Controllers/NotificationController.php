<?php

namespace App\Http\Controllers;

use App\Models\InAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = InAppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return inertia('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = InAppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function recent(Request $request): JsonResponse
    {
        $notifications = InAppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(10)
            ->get(['id', 'title', 'message', 'type', 'action_url', 'read_at', 'created_at']);

        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, InAppNotification $notification): JsonResponse|RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function markAllAsRead(Request $request): JsonResponse|RedirectResponse
    {
        InAppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'All notifications marked as read.']);
    }
}
