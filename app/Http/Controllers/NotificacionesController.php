<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificacionesController extends Controller
{
    public function leer(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $notification = $user->notifications()->where('id', $id)->first();
        if (! $notification) {
            return back()->with('error', 'Notificación no encontrada.');
        }

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return back();
    }

    public function leerTodas(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $user->unreadNotifications->markAsRead();

        return back()->with('success', 'Notificaciones marcadas como leídas.');
    }
}
