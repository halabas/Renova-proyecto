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
                    'rol' => $user->rol,
                    'deleted_at' => $user->deleted_at?->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('admin/usuarios', [
            'usuarios' => $usuarios,
        ]);
    }


    public function destroy(Request $request, User $user)
    {
        if ($user->trashed()) {
            return back()->with('error', 'El usuario ya está eliminado.');
        }

        $user->email = 'borrado+' . $user->id . '@renova.com';
        $user->save();
        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    public function actualizarRol(Request $request, User $user)
    {
        if ($user->trashed()) {
            return back()->with('error', 'No se puede cambiar el rol de un usuario eliminado.');
        }

        if ($user->rol === 'admin') {
            return back()->with('error', 'No se puede cambiar el rol de un administrador desde esta pantalla.');
        }

        $datos = $request->validate([
            'rol' => ['required', 'in:cliente,tecnico'],
        ]);

        $user->rol = $datos['rol'];
        $user->save();

        return back()->with('success', 'Rol actualizado correctamente.');
    }
}
