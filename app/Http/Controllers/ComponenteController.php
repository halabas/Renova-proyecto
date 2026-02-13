<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Componente;
use App\Models\Categoria;
use App\Models\Modelo;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\ProductoCarrito;
use Illuminate\Support\Facades\Storage;

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
                'descripcion' => $c->descripcion,
                'fotos' => $c->fotos,
            ]),
            'columnas' => ['id','nombre','categoria','modelo','marca','precio','stock','descripcion','fotos'],
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
                    'max' => 99999999.99,
                ],
                [
                    'name' => 'stock',
                    'label' => 'Stock',
                    'type' => 'number',
                ],
                [
                    'name' => 'descripcion',
                    'label' => 'Descripcion',
                    'type' => 'text',
                ],
                [
                    'name' => 'fotos',
                    'label' => 'Fotos',
                    'type' => 'text',
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $datos = $this->validaciones($request);

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

        $datos['fotos'] = $this->prepararFotos($request);
        if (! $datos['fotos']) {
            return back()->withErrors([
                'fotos' => 'Debes añadir al menos una foto del componente.',
            ])->withInput();
        }
        Componente::create($datos);

        return back()->with('success', 'Componente creado correctamente.');
    }

    public function update(Request $request, Componente $componente)
    {
        $datos = $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado(
            $request->only('nombre','categoria_id','modelo_id'),
            $componente->id
        );

        if ($duplicado) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe un componente idéntico con estas características.']
            ]);
        }

        $datos['fotos'] = $this->prepararFotos($request);
        if (! $datos['fotos']) {
            return back()->withErrors([
                'fotos' => 'Debes mantener al menos una foto del componente.',
            ])->withInput();
        }
        $componente->update($datos);

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

        $fotos = collect(explode(',', (string) $componente->fotos))
            ->map(fn ($url) => trim($url))
            ->filter(fn ($url) => $url !== '')
            ->values()
            ->all();

        return Inertia::render('producto', [
            'tipo' => 'componente',
            'componente' => [
                'id' => $componente->id,
                'nombre' => $componente->nombre,
                'precio' => $componente->precio,
                'fotos' => $fotos,
                'descripcion' => $componente->descripcion,
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

    private function validaciones(Request $request): array
    {
        return $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias,id',
            'modelo_id' => 'required|exists:modelos,id',
            'precio' => 'required|numeric|min:0|max:99999999.99',
            'stock' => 'required|integer|min:0',
            'descripcion' => 'required|string|max:2000',
            'fotos' => 'nullable|string|max:5000|required_without:fotos_archivos',
            'fotos_archivos' => 'nullable|array|max:12|required_without:fotos',
            'fotos_archivos.*' => 'image|max:5120',
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
            'precio.max' => 'El precio no puede superar 99.999.999,99.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser un texto válido.',
            'descripcion.max' => 'La descripción no puede superar 2000 caracteres.',
            'fotos.string' => 'El campo fotos debe ser un texto válido.',
            'fotos.max' => 'El campo fotos no puede superar 5000 caracteres.',
            'fotos.required_without' => 'Debes añadir al menos una foto.',
            'fotos_archivos.array' => 'Las fotos deben enviarse en formato de lista.',
            'fotos_archivos.max' => 'No puedes subir más de 12 fotos.',
            'fotos_archivos.required_without' => 'Debes subir al menos una foto.',
            'fotos_archivos.*.image' => 'Cada archivo debe ser una imagen válida.',
            'fotos_archivos.*.max' => 'Cada imagen puede pesar como máximo 5MB.',
        ]);
    }

    private function prepararFotos(Request $request): ?string
    {
        $urls = collect(explode(',', (string) $request->input('fotos')))
            ->map(fn ($url) => trim($url))
            ->filter(fn ($url) => $url !== '')
            ->filter(fn ($url) => str_starts_with($url, '/storage/') || filter_var($url, FILTER_VALIDATE_URL));

        foreach ((array) $request->file('fotos_archivos', []) as $archivo) {
            if (! $archivo) {
                continue;
            }
            $path = $archivo->store('productos/componentes', 'public');
            $urls->push(Storage::url($path));
        }

        $texto = $urls->unique()->values()->implode(',');

        return $texto !== '' ? $texto : null;
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
