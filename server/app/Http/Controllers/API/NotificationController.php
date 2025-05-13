<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function getAllNotifications($id)
    {
        $user = User::findOrFail($id);
        $notifications = $user->notifications;

        // Transforming notifications to include only necessary attributes
        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'data' => $notification->data,
                'notification_id' => $notification->id,
                'read_at' => $notification->read_at,
                'type' => $notification->type,
            ];
        });

        $unreadNotification = $user->unreadNotifications;

        return response()->json([
            'notifications' => $formattedNotifications,
            'unread_notification' => $unreadNotification
        ]);
    }
    public function markAllAsRead($userId)
    {
        // Attempt to update all unread notifications for the specific user
        $updatedRows = DB::table('notifications')
            ->where('notifiable_id', $userId) // or 'user_id', depending on your table structure
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Check if any rows were affected
        if ($updatedRows > 0) {
            return response()->json(['success' => true, 'updated' => $updatedRows]);
        }

        return response()->json(['success' => false, 'message' => 'No unread notifications found for this user.'], 404);
    }

    public function getNotifications($id)
    {
        $user = User::findOrFail($id);

        // Fetching notifications in descending order of creation, limited to 5
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'data' => $notification->data,
                'read_at' => $notification->read_at,
                'type' => $notification->type,
            ];
        });

        $unreadNotification = $user->unreadNotifications;
        return response()->json([
            'notifications' => $formattedNotifications,
            'unread_notification' => $unreadNotification
        ]);
    }


    /**
     * Get all unread notifications for a specific user.
     *
     * @param int $id User ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadNotifications($id)
    {
        $user = User::findOrFail($id);
        $unreadNotifications = $user->unreadNotifications;

        $formattedNotifications = $unreadNotifications->map(function ($notification) {
            return [
                'data' => $notification->data,
                'read_at' => $notification->read_at,
                'type' => $notification->type,
            ];
        });

        return response()->json([
            'unread_notifications' => $formattedNotifications,
        ]);
    }

    /**
     * Mark all unread notifications as read for a specific user.
     *
     * @param int $id User ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead($id)
    {
        // Attempt to update the notification with the specific ID
        $notification = DB::table('notifications')
            ->where('id', $id)
            ->update(['read_at' => now()]);

        // Check if any rows were affected
        if ($notification > 0) {
            return response()->json(['success' => true], 200);
        }

        return response()->json(['success' => false], 404);
    }


    /*  public function countUnreadNotifications($id)
     {
         $user = User::findOrFail($id);
         $unreadCount = $user->unreadNotifications()->count();

         broadcast(new NotificationEvent($user,$unreadCount));

         return response()->json([
             'Number of unread notification' => $unreadCount,
         ]);
     } */

     public function markAsReadNotification($id) {
        $user = Auth::user();

        $notification = $user->notifications
        ->where("id", $id)
        ->first();

        $notification->markAsRead();

        return response()->json([
            'message' => "Marked as read successfully!"
        ], 204);
     }
}
