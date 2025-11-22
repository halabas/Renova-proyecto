<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reparacion;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class ReparacionController extends Controller
{
    public function index()
    {
        $reparaciones = Reparacion::all();

        return Inertia::render('crud/crud', [
            'nombre_modelo' => 'reparaciones',
            'datos' => $reparaciones->map(fn($r) => [
                'id' => $r->id,
                'nombre' => $r->nombre,
                'precio_base' => $r->precio_base,
            ]),
            'columnas' => ['id','nombre','precio_base'],
            'campos' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ['name' => 'precio_base', 'label' => 'Precio Base', 'type' => 'number'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre);

        Reparacion::create($request->only('nombre', 'precio_base'));

        return back()->with('success', 'Reparación creada correctamente.');
    }

    public function update(Request $request, Reparacion $reparacion)
    {
        $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre, $reparacion->id);

        $reparacion->update($request->only('nombre', 'precio_base'));

        return back()->with('success', 'Reparación actualizada correctamente.');
    }

    public function destroy(Reparacion $reparacion)
    {
        $reparacion->delete();
        return back()->with('success', 'Reparación eliminada correctamente.');
    }

    private function validaciones(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio_base' => 'required|numeric|min:0',
        ], [
            'nombre.required' => 'El nombre de la reparación es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto.',
            'nombre.max' => 'El nombre no puede superar los 255 caracteres.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric' => 'El precio debe ser un número válido.',
            'precio_base.min' => 'El precio base no puede ser negativo.',
        ]);
    }

    private function comprobarDuplicado(string $nombre, ?int $reparacion_edit_id = null)
    {
        $query = Reparacion::whereRaw('LOWER(nombre) = ?', [strtolower($nombre)]);

        if ($reparacion_edit_id) {
            $query->where('id', '<>', $reparacion_edit_id);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe una reparación con este nombre.']
            ]);
        }
    }
}
