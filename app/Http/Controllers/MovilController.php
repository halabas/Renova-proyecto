<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movil;
use App\Models\Modelo;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class MovilController extends Controller
{
    public function index()
    {
        $moviles = Movil::with('modelo.marca')->get();

        return Inertia::render('crud/crud', [
            'nombre_modelo' => 'moviles',
            'datos' => $moviles->map(fn($m) => [
                'id' => $m->id,
                'modelo_id' => $m->modelo->id,
                'modelo' => $m->modelo->nombre,
                'marca' => $m->modelo->marca->nombre,
                'color' => $m->color,
                'grado' => $m->grado,
                'almacenamiento' => $m->almacenamiento,
                'stock' => $m->stock,
            ]),
            'columnas' => ['id','modelo','marca','color','grado','almacenamiento','stock'],
            'campos' => [
                [
                    'name' => 'modelo_id',
                    'label' => 'Modelo',
                    'type' => 'select',
                    'options' => Modelo::all()->map(fn($mod) => [
                        'value' => $mod->id,
                        'label' => $mod->nombre . ' - ' . $mod->marca->nombre
                    ])
                ],
                [
                    'name' => 'color',
                    'label' => 'Color',
                    'type' => 'select',
                    'options' => collect(['Negro','Blanco','Rojo','Azul','Verde','Amarillo','Morado','Gris','Dorado','Plateado','Naranja','Marron'])
                        ->map(fn($c) => ['value' => $c, 'label' => $c])
                ],
                [
                    'name' => 'grado',
                    'label' => 'Grado',
                    'type' => 'select',
                    'options' => collect(['S','A+','A','B'])
                        ->map(fn($g) => ['value' => $g, 'label' => $g])
                ],
                [
                    'name' => 'almacenamiento',
                    'label' => 'Almacenamiento (GB)',
                    'type' => 'select',
                    'options' => collect([32,64,128,256,512,1024,2048])
                        ->map(fn($a) => ['value' => $a, 'label' => $a])
                ],
                [
                    'name' => 'stock',
                    'label' => 'Stock',
                    'type' => 'number'
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado(
            $request->only('modelo_id','color','grado','almacenamiento')
        );

        if ($duplicado) {
            $duplicado->update([
                'stock' => $duplicado->stock + ($request->stock ?? 1)
            ]);
        }

        Movil::create($request->only('modelo_id','color','grado','almacenamiento','stock'));
    }

    public function update(Request $request, Movil $movil)
    {
        $this->validaciones($request);

        $duplicado = $this->comprobarDuplicado(
            $request->only('modelo_id','color','grado','almacenamiento'),
            $movil->id
        );

        if ($duplicado) {
            throw ValidationException::withMessages([
                'modelo_id' => ['Ya existe un móvil idéntico con estas características.']
            ]);
        }

        $movil->update($request->only('modelo_id','color','grado','almacenamiento','stock'));
    }

    public function destroy(Movil $movil)
    {
        $movil->delete();
    }

    private function validaciones(Request $request)
    {
        $request->validate([
            'modelo_id' => 'required|exists:modelos,id',
            'color' => 'required|string|max:50',
            'grado' => 'required|in:S,A+,A,B',
            'almacenamiento' => 'required|integer|min:1',
            'stock' => 'required|integer|min:1',
        ], [
            'modelo_id.required' => 'Debes seleccionar un modelo.',
            'modelo_id.exists' => 'El modelo seleccionado no es válido.',
            'color.required' => 'El color es obligatorio.',
            'color.string' => 'El color debe ser un texto válido.',
            'color.max' => 'El color no puede tener más de 50 caracteres.',
            'grado.required' => 'Debes seleccionar un grado.',
            'grado.in' => 'El grado seleccionado no es válido.',
            'almacenamiento.required' => 'El almacenamiento es obligatorio.',
            'almacenamiento.integer' => 'El almacenamiento debe ser un número entero.',
            'almacenamiento.min' => 'El almacenamiento debe ser al menos 1.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock debe ser al menos 1.',
        ]);
    }

    private function comprobarDuplicado(array $datos, ?int $movil_edit_id = null): ?Movil
    {
        $query = Movil::where('modelo_id', $datos['modelo_id'])
            ->where('color', $datos['color'])
            ->where('grado', $datos['grado'])
            ->where('almacenamiento', $datos['almacenamiento']);

        if ($movil_edit_id) {
            $query->where('id', '<>', $movil_edit_id);
        }

        return $query->first();
    }
}
