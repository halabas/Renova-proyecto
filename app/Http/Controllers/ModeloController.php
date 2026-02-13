<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Modelo;
use App\Models\Marca;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\ProductoCarrito;
use App\Models\Movil;
use Illuminate\Support\Facades\Storage;

class ModeloController extends Controller
{
    public function index()
    {
        $modelos = Modelo::with('marca')->get();

        return Inertia::render('crud/crud', [
            'nombre_ruta' => 'modelos',
            'datos' => $modelos->map(fn($modelo) => [
                'id' => $modelo->id,
                'nombre' => $modelo->nombre,
                'marca_id' => $modelo->marca->id,
                'marca' => $modelo->marca->nombre,
                'precio_base' => $modelo->precio_base,
                'descripcion' => $modelo->descripcion,
                'fotos' => $modelo->fotos,
            ]),
            'columnas' => ['id', 'nombre', 'marca', 'precio_base', 'descripcion', 'fotos'],
            'campos' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                [
                    'name' => 'marca_id',
                    'label' => 'Marca',
                    'type' => 'select',
                    'options' => Marca::all()->map(fn($marca) => [
                        'value' => $marca->id,
                        'label' => $marca->nombre
                    ])
                ],
                ['name' => 'precio_base', 'label' => 'Precio Base', 'type' => 'number', 'max' => 99999999.99],
                ['name' => 'descripcion', 'label' => 'Descripcion', 'type' => 'text'],
                ['name' => 'fotos', 'label' => 'Fotos', 'type' => 'text'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $datos = $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre, $request->marca_id);

        $datos['fotos'] = $this->prepararFotos($request);
        if (! $datos['fotos']) {
            return back()->withErrors([
                'fotos' => 'Debes añadir al menos una foto del modelo.',
            ])->withInput();
        }
        Modelo::create($datos);

        return redirect()->back()->with('success', 'Modelo creado correctamente.');
    }

    public function update(Request $request, Modelo $modelo)
    {
        $datos = $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre, $request->marca_id, $modelo->id);

        $datos['fotos'] = $this->prepararFotos($request);
        if (! $datos['fotos']) {
            return back()->withErrors([
                'fotos' => 'Debes mantener al menos una foto del modelo.',
            ])->withInput();
        }
        $modelo->update($datos);

        return redirect()->back()->with('success', 'Modelo actualizado correctamente.');
    }

    public function show(Modelo $modelo)
    {
        $modelo->load(['marca', 'moviles']);
        $stockPorVariante = [];
        // Se calcula el stock por pariante en un array asociativo usando como clave la combinacion de sus datos.
        foreach ($modelo->moviles as $movil) {
            $clave = $movil->color.'.'. $movil->grado.'.'.$movil->almacenamiento;
            $stockPorVariante[$clave] = $movil->stock;
        }

        $user = request()->user();
        if ($user) {

            // Se obtienen del carrito del usuarios los productosCarritos que son moviles.

            $moviles_id = $modelo->moviles->pluck('id')->all();
            $carritoMoviles = ProductoCarrito::where('user_id', $user->id)
                ->where('producto_type', Movil::class)
                ->whereIn('producto_id', $moviles_id)
                ->get();

            // Se asocia el ProductoCarrito con la id del producto original.
            $carritoPorId = [];
            foreach ($carritoMoviles as $productoCarrito) {
                $carritoPorId[$productoCarrito->producto_id] = $productoCarrito;
            }

            // Se itera sobre los moviles para comprobar el stock en carrito que luego se restara al stock por variantes calculado previamente.
            foreach ($modelo->moviles as $movil) {
                $clave = $movil->color.'.'.$movil->grado.'.'.$movil->almacenamiento;
                $cantidadEnCarrito = $carritoPorId[$movil->id]->cantidad ?? 0;
                $stockPorVariante[$clave] = max(0, $movil->stock - $cantidadEnCarrito);
            }
        }

        $coloresDisponibles = [];
        $gradosDisponibles = [];
        $almacenamientosDisponibles = [];

        foreach ($stockPorVariante as $clave => $stock) {
            if ($stock <= 0) {
                continue;
            }

            [$color, $grado, $almacenamiento] = explode('.', $clave);

            $coloresDisponibles[] = $color;
            $gradosDisponibles[] = $grado;
            $almacenamientosDisponibles[] = (int) $almacenamiento;
        }

        $coloresDisponibles = array_values(array_unique($coloresDisponibles));
        $gradosDisponibles = array_values(array_unique($gradosDisponibles));
        $almacenamientosDisponibles = array_values(array_unique($almacenamientosDisponibles));

        $fotos = [];
        foreach (explode(',', (string) $modelo->fotos) as $url) {
            $urlLimpia = trim($url);
            if ($urlLimpia === '') {
                continue;
            }
            $fotos[] = $urlLimpia;
        }

        return Inertia::render('producto', [
            'tipo' => 'modelo',
            'modelo' => [
                'id' => $modelo->id,
                'nombre' => $modelo->nombre,
                'marca' => $modelo->marca->nombre,
                'eslogan' => $modelo->marca->eslogan,
                'precio_base' => $modelo->precio_base,
                'descripcion' => $modelo->descripcion,
                'fotos' => $fotos,
            ],
            'coloresDisponibles' => $coloresDisponibles,
            'gradosDisponibles' => $gradosDisponibles,
            'almacenamientosDisponibles' => $almacenamientosDisponibles,
            'stockPorVariante' => $stockPorVariante,
        ]);
    }

    public function destroy(Modelo $modelo)
    {
        $modelo->delete();
        return redirect()->back()->with('success', 'Modelo eliminado correctamente.');
    }

    private function validaciones(Request $request): array
    {
        return $request->validate([
            'nombre' => 'required|string|max:255',
            'marca_id' => 'required|exists:marcas,id',
            'precio_base' => 'required|numeric|min:0|max:99999999.99',
            'descripcion' => 'required|string|max:2000',
            'fotos' => 'nullable|string|max:5000|required_without:fotos_archivos',
            'fotos_archivos' => 'nullable|array|max:5|required_without:fotos',
            'fotos_archivos.*' => 'image|max:5120',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'marca_id.required' => 'Debes seleccionar una marca.',
            'marca_id.exists' => 'La marca seleccionada no es válida.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric' => 'El precio debe ser un número válido.',
            'precio_base.max' => 'El precio base no puede superar 99.999.999,99.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser un texto válido.',
            'descripcion.max' => 'La descripción no puede superar 2000 caracteres.',
            'fotos.string' => 'El campo fotos debe ser un texto válido.',
            'fotos.max' => 'El campo fotos no puede superar 5000 caracteres.',
            'fotos.required_without' => 'Debes añadir al menos una foto.',
            'fotos_archivos.array' => 'Las fotos deben enviarse en formato de lista.',
            'fotos_archivos.max' => 'No puedes subir más de 5 fotos.',
            'fotos_archivos.required_without' => 'Debes subir al menos una foto.',
            'fotos_archivos.*.image' => 'Cada archivo debe ser una imagen válida.',
            'fotos_archivos.*.max' => 'Cada imagen puede pesar como máximo 5MB.',
        ]);
    }

    // Se encarga de combinar las urls de fotos que ya existian con las fotos nuevas.
    private function prepararFotos(Request $request): ?string
    {
        // Se obtienen las urls que ya existian y se trimean.
        $urls = collect(explode(',', (string) $request->input('fotos')))
            ->map(fn ($url) => trim($url))
            ->filter(fn ($url) => $url !== '');

        // Se guardan las nuevas fotos en public y se obtienen las urls para añadirlas a las que ya existian
        foreach ((array) $request->file('fotos_archivos', []) as $archivo) {
            if (! $archivo) {
                continue;
            }
            $path = $archivo->store('productos/modelos', 'public');
            $urls->push(Storage::url($path));
        }
        // Se eliminan sanea y se vuelven a separar por comas.
        $urls_fotos = $urls->unique()->values()->implode(',');

        return $urls_fotos !== '' ? $urls_fotos : null;
    }

    //Comprueba que no exista otro modelo con el mismo nombre para la misma marca.
    private function comprobarDuplicado(string $nombre, int $marca_id, ?int $modelo_edit_id = null)
    {
        $consulta = Modelo::where('marca_id', $marca_id)
            ->whereRaw('LOWER(nombre) = ?', [strtolower($nombre)]);

            // Si se está editando un modelo, no se tiene en cuenta a la hora de comprobar si esta duplicado.
        if ($modelo_edit_id) {
            $consulta->whereNot('id', $modelo_edit_id);
        }

        if ($consulta->exists()) {
            throw ValidationException::withMessages([
                'nombre' => ['Ya existe un modelo con este nombre para la marca seleccionada.']
            ]);
        }
    }
}
