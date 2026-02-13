<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Componente;
use App\Models\Modelo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ComponenteSeeder extends Seeder
{
    public function run(): void
    {
        $preciosPorCategoria = [
            'Pantallas' => [79, 199],
            'Baterias' => [39, 99],
            'Camaras' => [69, 179],
            'Altavoces' => [29, 89],
        ];

        $categorias = Categoria::whereIn('nombre', array_keys($preciosPorCategoria))->get()->keyBy('nombre');
        $modelos = Modelo::all();

        foreach ($modelos as $modelo) {
            foreach ($preciosPorCategoria as $nombreCategoria => [$min, $max]) {
                $categoria = $categorias[$nombreCategoria] ?? null;
                if (! $categoria) {
                    continue;
                }

                $slugCategoria = Str::slug($nombreCategoria);
                $fotosCategoria = $this->leerFotosCategoria($slugCategoria);
                if (empty($fotosCategoria)) {
                    continue;
                }
                $fotos = $this->seleccionarFotos($fotosCategoria, $modelo->id);

                Componente::updateOrCreate(
                    [
                        'nombre' => "{$nombreCategoria} {$modelo->nombre}",
                        'categoria_id' => $categoria->id,
                        'modelo_id' => $modelo->id,
                    ],
                    [
                        'precio' => rand($min, $max),
                        'stock' => rand(2, 20),
                        'descripcion' => "Componente de {$nombreCategoria} compatible con {$modelo->nombre}.",
                        'fotos' => implode(',', $fotos),
                    ]
                );
            }
        }
    }

    private function leerFotosCategoria(string $slugCategoria): array
    {
        $base = public_path('imagenes/componentes/' . $slugCategoria);
        if (! is_dir($base)) {
            return [];
        }

        return collect(scandir($base))
            ->filter(fn ($archivo) => ! in_array($archivo, ['.', '..'], true))
            ->filter(fn ($archivo) => ! str_contains($archivo, ','))
            ->filter(function ($archivo) {
                $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
                return in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true);
            })
            ->sort()
            ->values()
            ->map(fn ($archivo) => '/imagenes/componentes/' . $slugCategoria . '/' . $archivo)
            ->all();
    }

    private function seleccionarFotos(array $fotosDisponibles, int $semilla): array
    {
        $total = count($fotosDisponibles);
        if ($total === 0) {
            return [];
        }

        $inicio = $semilla % $total;
        $fotos = [];

        for ($i = 0; $i < 4; $i++) {
            $fotos[] = $fotosDisponibles[($inicio + $i) % $total];
        }

        return $fotos;
    }
}
