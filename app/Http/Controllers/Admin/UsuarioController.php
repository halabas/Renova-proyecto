<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarioActual = auth()->id();

        $usuarios = User::withTrashed()
            ->where('id', '<>', $usuarioActual)
            ->orderBy('id')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => (bool) $user->is_admin,
                    'deleted_at' => $user->deleted_at?->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('admin/usuarios', [
            'usuarios' => $usuarios,
        ]);
    }


    public function destroy(Request $request, User $user)
    {
        $user->email = 'borrado+' . $user->id . '@renova.com';
        $user->save();
        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }
}
