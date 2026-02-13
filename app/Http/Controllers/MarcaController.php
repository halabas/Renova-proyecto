<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;
use Inertia\Inertia;

class MarcaController extends Controller
{

    public function index()
    {
        $marcas = Marca::all();

        return Inertia::render('crud/crud', [
            'nombre_ruta' => 'marcas',
            'datos' => $marcas,
            'columnas' => ['id', 'nombre', 'eslogan'],
            'campos' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ['name' => 'eslogan', 'label' => 'Eslogan', 'type' => 'text', 'required' => false],
            ],
        ]);
    }


    public function store(Request $request)
    {
        $request->validate(
            [
                'nombre' => 'required|string|max:255|unique:marcas,nombre',
                'eslogan' => 'nullable|string|max:255',
            ],
            [
                'nombre.required' => 'El nombre de la marca es obligatorio.',
                'nombre.string' => 'El nombre debe ser un texto válido.',
                'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
                'nombre.unique' => 'Ya existe una marca con ese nombre.',
                'eslogan.string' => 'El eslogan debe ser un texto válido.',
                'eslogan.max' => 'El eslogan no puede tener más de 255 caracteres.',
            ]
        );

        Marca::create($request->only('nombre', 'eslogan'));

        return redirect()->back()->with('success', 'Marca creada correctamente.');
    }

    public function update(Request $request, Marca $marca)
    {
        $request->validate(
            [
                'nombre' => 'required|string|max:255|unique:marcas,nombre,' . $marca->id,
                'eslogan' => 'nullable|string|max:255',
            ],
            [
                'nombre.required' => 'El nombre de la marca es obligatorio.',
                'nombre.string' => 'El nombre debe ser un texto válido.',
                'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
                'nombre.unique' => 'Ya existe una marca con ese nombre.',
                'eslogan.string' => 'El eslogan debe ser un texto válido.',
                'eslogan.max' => 'El eslogan no puede tener más de 255 caracteres.',
            ]
        );

        $marca->update($request->only('nombre', 'eslogan'));

        return redirect()->back()->with('success', 'Marca actualizada correctamente.');
    }


    public function destroy(Marca $marca)
    {
        $marca->delete();
        return redirect()->back()->with('success', 'Marca eliminada correctamente.');
    }
}
