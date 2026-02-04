<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Modelo;
use App\Models\Marca;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\ProductoCarrito;
use App\Models\Movil;

class ModeloController extends Controller
{
    public function index()
    {
        $modelos = Modelo::with('marca')->get();

        return Inertia::render('crud/crud', [
            'nombre_modelo' => 'modelos',
            'datos' => $modelos->map(fn($modelo) => [
                'id' => $modelo->id,
                'nombre' => $modelo->nombre,
                'marca_id' => $modelo->marca->id,
                'marca' => $modelo->marca->nombre,
                'precio_base' => $modelo->precio_base,
            ]),
            'columnas' => ['id', 'nombre', 'marca', 'precio_base'],
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
                ['name' => 'precio_base', 'label' => 'Precio Base', 'type' => 'number']
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre, $request->marca_id);

        Modelo::create($request->only('nombre', 'marca_id', 'precio_base'));

        return redirect()->back()->with('success', 'Modelo creado correctamente.');
    }

    public function update(Request $request, Modelo $modelo)
    {
        $this->validaciones($request);

        $this->comprobarDuplicado($request->nombre, $request->marca_id, $modelo->id);

        $modelo->update($request->only('nombre', 'marca_id', 'precio_base'));

        return redirect()->back()->with('success', 'Modelo actualizado correctamente.');
    }

    public function show(Modelo $modelo)
    {
        $modelo->load(['marca', 'moviles']);

        $coloresDisponibles = $modelo->moviles
            ->pluck('color')
            ->unique()
            ->values()
            ->all();
        $gradosDisponibles = $modelo->moviles
            ->pluck('grado')
            ->unique()
            ->values()
            ->all();
        $almacenamientosDisponibles = $modelo->moviles
            ->pluck('almacenamiento')
            ->unique()
            ->values()
            ->all();
            // Crear un array asociativo con la combinaciones posibles y  su stock.
        $stockPorVariante = [];
        foreach ($modelo->moviles as $movil) {
            $clave = $movil->color . '|' . $movil->grado . '|' . $movil->almacenamiento;
            $stockPorVariante[$clave] = $movil->stock;
        }

        $user = request()->user();
        if ($user) {
            $moviles_id = $modelo->moviles->pluck('id')->all();
            $carritoMoviles = ProductoCarrito::where('user_id', $user->id)
                ->where('producto_type', Movil::class)
                ->whereIn('producto_id', $moviles_id)
                ->get();

            $carritoPorId = [];
            foreach ($carritoMoviles as $item) {
                $carritoPorId[$item->producto_id] = $item;
            }

            foreach ($modelo->moviles as $movil) {
                $clave = $movil->color . '|' . $movil->grado . '|' . $movil->almacenamiento;
                $cantidadEnCarrito = $carritoPorId[$movil->id]->cantidad ?? 0;
                $stockPorVariante[$clave] = max(0, $movil->stock - $cantidadEnCarrito);
            }
        }

        return Inertia::render('producto', [
            'tipo' => 'modelo',
            'modelo' => [
                'id' => $modelo->id,
                'nombre' => $modelo->nombre,
                'marca' => $modelo->marca->nombre,
                'precio_base' => $modelo->precio_base,
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

    private function validaciones(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'marca_id' => 'required|exists:marcas,id',
            'precio_base' => 'required|numeric|min:0',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'marca_id.required' => 'Debes seleccionar una marca.',
            'marca_id.exists' => 'La marca seleccionada no es válida.',
            'precio_base.required' => 'El precio base es obligatorio.',
            'precio_base.numeric' => 'El precio debe ser un número válido.',
        ]);
    }

    private function comprobarDuplicado(string $nombre, int $marca_id, ?int $modelo_edit_id = null)
    {
        $consulta = Modelo::where('marca_id', $marca_id)
            ->whereRaw('LOWER(nombre) = ?', [strtolower($nombre)]);

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
