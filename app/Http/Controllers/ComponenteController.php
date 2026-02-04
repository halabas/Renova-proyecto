<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Componente;
use App\Models\Categoria;
use App\Models\Modelo;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\ProductoCarrito;

class ComponenteController extends Controller
{
    public function index()
    {
        $componentes = Componente::with('categoria', 'modelo.marca')->get();

        return Inertia::render('crud/crud', [
            'nombre_modelo' => 'componentes',
            'datos' => $componentes->map(fn($c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'categoria_id' => $c->categoria->id,
                'categoria' => $c->categoria->nombre,
                'modelo_id' => $c->modelo->id,
                'modelo' => $c->modelo->nombre,
                'marca' => $c->modelo->marca->nombre,
                'precio' => $c->precio,
                'stock' => $c->stock,
            ]),
            'columnas' => ['id','nombre','categoria','modelo','marca','precio','stock'],
            'campos' => [
                [
                    'name' => 'nombre',
                    'label' => 'Nombre',
                    'type' => 'text',
                ],
                [
                    'name' => 'categoria_id',
                    'label' => 'Categoría',
                    'type' => 'select',
                    'options' => Categoria::all()->map(fn($cat) => [
                        'value' => $cat->id,
                        'label' => $cat->nombre
                    ]),
                ],
                [
                    'name' => 'modelo_id',
                    'label' => 'Modelo',
                    'type' => 'select',
                    'options' => Modelo::all()->map(fn($mod) => [
                        'value' => $mod->id,
                        'label' => $mod->nombre . ' - ' . $mod->marca->nombre
                    ]),
                ],
                [
                    'name' => 'precio',
                    'label' => 'Precio',
                    'type' => 'number',
                ],
                [
                    'name' => 'stock',
                    'label' => 'Stock',
                    'type' => 'number',
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado(
            $request->only('nombre', 'categoria_id', 'modelo_id')
        );

        if ($duplicado) {
            if ($duplicado->precio != $request->precio) {
                return back()->withErrors([
                    'precio' => 'Ya existe un componente idéntico con otro precio. No se puede crear.'
                ])->withInput();
            }

            $duplicado->update([
                'stock' => $duplicado->stock + ($request->stock ?? 1)
            ]);

            return back()->with('success', 'Componente ya existía, stock incrementado correctamente.');
        }

        Componente::create($request->only('nombre', 'categoria_id', 'modelo_id', 'precio', 'stock'));

        return back()->with('success', 'Componente creado correctamente.');
    }

    public function update(Request $request, Componente $componente)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado(
            $request->only('nombre','categoria_id','modelo_id'),
            $componente->id
        );

        if ($duplicado) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe un componente idéntico con estas características.']
            ]);
        }

        $componente->update($request->only('nombre','categoria_id','modelo_id','precio','stock'));

        return back()->with('success', 'Componente actualizado correctamente.');
    }

    public function show(Componente $componente)
    {
        $componente->load(['categoria', 'modelo.marca']);

        $categoria = $componente->categoria?->nombre;
        $marca = $componente->modelo?->marca?->nombre;
        $modelo = $componente->modelo?->nombre;
        $subtitulo = "$categoria";
        $stockDisponible = $componente->stock;

        $user = request()->user();
        if ($user) {
            $productoCarrito = ProductoCarrito::where('user_id', $user->id)
                ->where('producto_type', Componente::class)
                ->where('producto_id', $componente->id)
                ->first();
            $cantidadEnCarrito = $productoCarrito?->cantidad ?? 0;
            $stockDisponible = max(0, $componente->stock - $cantidadEnCarrito);
        }

        return Inertia::render('producto', [
            'tipo' => 'componente',
            'componente' => [
                'id' => $componente->id,
                'nombre' => $componente->nombre,
                'precio' => $componente->precio,
                'imagen' => null,
                'subtitulo' => $subtitulo,
                'categoria' => $categoria,
                'marca' => $marca,
                'modelo' => $modelo,
                'stock_disponible' => $stockDisponible,
            ],
        ]);
    }

    public function destroy(Componente $componente)
    {
        $componente->delete();

        return back()->with('success', 'Componente eliminado correctamente.');
    }

    private function validaciones(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias,id',
            'modelo_id' => 'required|exists:modelos,id',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto.',
            'nombre.max' => 'El nombre no puede superar 255 caracteres.',
            'categoria_id.required' => 'Debes seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',
            'modelo_id.required' => 'Debes seleccionar un modelo.',
            'modelo_id.exists' => 'El modelo seleccionado no es válido.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
        ]);
    }

    private function comprobarDuplicado(array $datos, ?int $componente_edit_id = null): ?Componente
    {
        $query = Componente::where('nombre', $datos['nombre'])
            ->where('categoria_id', $datos['categoria_id'])
            ->where('modelo_id', $datos['modelo_id']);

        if ($componente_edit_id) {
            $query->where('id', '<>', $componente_edit_id);
        }

        return $query->first();
    }
}
