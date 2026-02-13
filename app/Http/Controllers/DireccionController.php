<?php

namespace App\Http\Controllers;

use App\Models\Direccion;
use Illuminate\Http\Request;

class DireccionController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->direcciones()->count() >= 3) {
            return back()->with('error', 'Solo puedes tener hasta 3 direcciones.');
        }

        $datos = $request->validate([
            'etiqueta' => ['required', 'string', 'max:50'],
            'nombre' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:150'],
            'dni' => ['required', 'regex:/^[0-9]{8}[A-Za-z]$/'],
            'telefono' => ['required', 'digits:9'],
            'direccion' => ['required', 'string', 'max:255'],
            'ciudad' => ['required', 'string', 'max:100'],
            'provincia' => ['required', 'string', 'max:100'],
            'codigo_postal' => ['required', 'digits:5'],
            'predeterminada' => ['nullable', 'boolean'],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.regex' => 'El DNI debe tener 8 números y una letra (ej: 12345678Z).',
        ]);

        $esPrimera = $user->direcciones()->count() === 0;
        $predeterminada = $esPrimera || ($datos['predeterminada'] ?? false);

        if ($predeterminada) {
            $user->direcciones()->update(['predeterminada' => false]);
        }

        Direccion::create([
            'user_id' => $user->id,
            'etiqueta' => $datos['etiqueta'],
            'nombre' => $datos['nombre'],
            'apellidos' => $datos['apellidos'],
            'dni' => strtoupper($datos['dni']),
            'telefono' => $datos['telefono'],
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad'],
            'provincia' => $datos['provincia'],
            'codigo_postal' => $datos['codigo_postal'],
            'predeterminada' => $predeterminada,
        ]);

        return back()->with('success', 'Dirección añadida.');
    }

    public function update(Request $request, Direccion $direccion)
    {
        $user = $request->user();
        if (! $user || $direccion->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $datos = $request->validate([
            'etiqueta' => ['required', 'string', 'max:50'],
            'nombre' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:150'],
            'dni' => ['required', 'regex:/^[0-9]{8}[A-Za-z]$/'],
            'telefono' => ['required', 'digits:9'],
            'direccion' => ['required', 'string', 'max:255'],
            'ciudad' => ['required', 'string', 'max:100'],
            'provincia' => ['required', 'string', 'max:100'],
            'codigo_postal' => ['required', 'digits:5'],
            'predeterminada' => ['nullable', 'boolean'],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.regex' => 'El DNI debe tener 8 números y una letra (ej: 12345678Z).',
        ]);

        $predeterminada = $datos['predeterminada'] ?? false;
        if ($predeterminada) {
            $user->direcciones()->update(['predeterminada' => false]);
        }

        $direccion->update([
            'etiqueta' => $datos['etiqueta'],
            'nombre' => $datos['nombre'],
            'apellidos' => $datos['apellidos'],
            'dni' => strtoupper($datos['dni']),
            'telefono' => $datos['telefono'],
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad'],
            'provincia' => $datos['provincia'],
            'codigo_postal' => $datos['codigo_postal'],
            'predeterminada' => $predeterminada,
        ]);

        return back()->with('success', 'Dirección actualizada.');
    }

    public function destroy(Request $request, Direccion $direccion)
    {
        $user = $request->user();
        if (! $user || $direccion->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $eraPredeterminada = $direccion->predeterminada;
        $direccion->delete();

        if ($eraPredeterminada) {
            $nuevaPredeterminada = $user->direcciones()->orderBy('id')->first();
            if ($nuevaPredeterminada) {
                $nuevaPredeterminada->update(['predeterminada' => true]);
            }
        }

        return back()->with('success', 'Dirección eliminada.');
    }
}
