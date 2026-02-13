<?php

namespace App\Http\Controllers;

use App\Models\Modelo;
use App\Support\Colores;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    use Colores;

    public function index()
    {
        $modelos = Modelo::with('marca')
            ->orderByDesc('id')
            ->take(9)
            ->get();

        $colores = $this->ponerColores($modelos->pluck('id')->all());
        return Inertia::render('home', [
            'canRegister' => Features::enabled(Features::registration()),
            'modelos' => $modelos->map(function ($modelo) use ($colores) {
                return [
                    'id' => $modelo->id,
                    'nombre' => trim($modelo->marca->nombre . ' ' . $modelo->nombre),
                    'precio' => $modelo->precio_base,
                    'imagen' => $this->primeraFoto($modelo->fotos),
                    'coloresDisponibles' => $colores[$modelo->id] ?? [],
                ];
            }),
        ]);
    }

    private function primeraFoto(?string $fotos): ?string
    {
        if (! $fotos) {
            return null;
        }

        $primera = trim(explode(',', $fotos)[0] ?? '');

        return $primera !== '' ? $primera : null;
    }
}
