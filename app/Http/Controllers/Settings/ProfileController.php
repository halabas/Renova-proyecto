<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $direcciones = $request->user()
            ->direcciones()
            ->orderByDesc('predeterminada')
            ->orderBy('id')
            ->get()
            ->map(function ($direccion) {
                return [
                    'id' => $direccion->id,
                    'etiqueta' => $direccion->etiqueta,
                    'nombre' => $direccion->nombre,
                    'apellidos' => $direccion->apellidos,
                    'telefono' => $direccion->telefono,
                    'direccion' => $direccion->direccion,
                    'ciudad' => $direccion->ciudad,
                    'provincia' => $direccion->provincia,
                    'codigo_postal' => $direccion->codigo_postal,
                    'predeterminada' => $direccion->predeterminada,
                ];
            });

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'direcciones' => $direcciones,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->email = 'borrado' . $user->id . '@renova.com';
        $user->save();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
