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
            'nombre_modelo' => 'marcas',
            'datos' => $marcas,
            'columnas' => ['id', 'nombre'],
            'campos' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
            ],
        ]);
    }


public function store(Request $request)
{
    $request->validate(
        [
            'nombre' => 'required|string|max:255|unique:marcas,nombre',
        ],
        [
            'nombre.required' => 'El nombre de la marca es obligatorio.',
            'nombre.string' => 'El nombre debe ser un texto válido.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'nombre.unique' => 'Ya existe una marca con ese nombre.',
        ]
    );

    Marca::create($request->only('nombre'));

    return redirect()->back();
}

public function update(Request $request, Marca $marca)
{
    $request->validate(
        [
            'nombre' => 'required|string|max:255|unique:marcas,nombre,' . $marca->id,
        ],
        [
            'nombre.required' => 'El nombre de la marca es obligatorio.',
            'nombre.string' => 'El nombre debe ser un texto válido.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'nombre.unique' => 'Ya existe una marca con ese nombre.',
        ]
    );

    $marca->update($request->only('nombre'));

    return redirect()->back();
}


    public function destroy(Marca $marca)
    {
        $marca->delete();
        return redirect()->back();
    }
}
