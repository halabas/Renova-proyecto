<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::all();

        return Inertia::render('crud/crud', [
            'nombre_ruta' => 'categorias',
            'datos' => $categorias->map(fn($categoria) => [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
            ]),
            'columnas' => ['id','nombre'],
            'campos' => [
                [
                    'name' => 'nombre',
                    'label' => 'Nombre',
                    'type' => 'text',
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado($request->nombre);

        if ($duplicado) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe una categoría con este nombre.']
            ]);
        }

        Categoria::create($request->only('nombre'));

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, Categoria $categoria)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado($request->nombre, $categoria->id);

        if ($duplicado) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe una categoría con este nombre.']
            ]);
        }

        $categoria->update($request->only('nombre'));

        return back()->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(Categoria $categoria)
    {
        $categoria->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }

    private function validaciones(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ], [
            'nombre.required' => 'El nombre de la categoría es obligatorio.',
            'nombre.string' => 'El nombre de la categoría debe ser un texto válido.',
            'nombre.max' => 'El nombre de la categoría no puede superar los 255 caracteres.',
        ]);
    }

    private function comprobarDuplicado(string $nombre, ?int $categoria_id_edit = null): ?Categoria
    {
        $consulta = Categoria::whereRaw('LOWER(nombre) = ?', [strtolower($nombre)]);

        if ($categoria_id_edit) {
            $consulta->where('id', '<>', $categoria_id_edit);
        }

        return $consulta->first();
    }
}
