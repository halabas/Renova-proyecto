<?php

namespace Database\Seeders;

use App\Models\Marca;
use App\Models\Modelo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ModelosBaseSeeder extends Seeder
{
    private array $carpetaMarca = [
        'Apple' => 'apple',
        'Samsung' => 'samsung',
        'Xiaomi' => 'xiaomi',
        'One plus' => 'oneplus',
    ];

    public function run(): void
    {
        $descripcionBase = "Pantalla OLED Super Retina XDR de 6,1 pulgadas. Camara dual 48 MP con grabacion 4K60 HDR. Chip A16 Bionic con alto rendimiento multitarea. 5G, Wi-Fi 6 y doble SIM/eSIM. Carga rapida e inalambrica MagSafe. Certificacion IP68 y diseno en aluminio azul.";

        $modelosPorMarca = [
            'Apple' => ['iPhone 11', 'iPhone 14', 'iPhone 16', 'iPhone 16 Pro'],
            'Samsung' => ['Galaxy S20 Ultra', 'Galaxy S23 Ultra', 'Galaxy S25 Ultra', 'Galaxy A55'],
            'Xiaomi' => ['Redmi Note 13', 'Xiaomi 15 Ultra', 'Xiaomi 14T', 'Xiaomi 13T'],
            'One plus' => ['OnePlus 8', 'OnePlus 12', 'OnePlus 13', 'OnePlus Nord 4'],
        ];

        foreach ($modelosPorMarca as $nombreMarca => $modelos) {
            $marca = Marca::where('nombre', $nombreMarca)->first();
            if (! $marca) {
                continue;
            }

            $slugMarca = $this->carpetaMarca[$nombreMarca] ?? Str::slug($nombreMarca);
            $fotosMarca = $this->leerFotosMarca($slugMarca);
            if (empty($fotosMarca)) {
                continue;
            }

            foreach ($modelos as $indice => $nombreModelo) {
                $fotos = $this->seleccionarFotosModelo($fotosMarca, $indice);
                Modelo::updateOrCreate(
                    ['nombre' => $nombreModelo, 'marca_id' => $marca->id],
                    [
                        'precio_base' => rand(299, 1199),
                        'descripcion' => $descripcionBase,
                        'fotos' => implode(',', $fotos),
                    ]
                );
            }
        }
    }

    private function leerFotosMarca(string $slugMarca): array
    {
        $base = public_path('imagenes/modelos/' . $slugMarca);
        if (! is_dir($base)) {
            return [];
        }

        $archivos = collect(scandir($base))
            ->filter(fn ($archivo) => ! in_array($archivo, ['.', '..'], true))
            ->filter(function ($archivo) {
                $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
                return in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true);
            })
            ->sort()
            ->values()
            ->map(fn ($archivo) => '/imagenes/modelos/' . $slugMarca . '/' . $archivo)
            ->all();

        return $archivos;
    }

    private function seleccionarFotosModelo(array $fotosMarca, int $indiceModelo): array
    {
        $total = count($fotosMarca);
        if ($total === 0) {
            return [];
        }

        $inicio = ($indiceModelo * 2) % $total;
        $seleccion = [];

        for ($i = 0; $i < 4; $i++) {
            $posicion = ($inicio + $i) % $total;
            $seleccion[] = $fotosMarca[$posicion];
        }

        return $seleccion;
    }
}
