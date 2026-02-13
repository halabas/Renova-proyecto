<?php

namespace Database\Seeders;

use App\Models\Marca;
use Illuminate\Database\Seeder;

class MarcasBaseSeeder extends Seeder
{
    public function run(): void
    {
        $marcas = [
            [
                'nombre' => 'Apple',
                'eslogan' => 'Potencia premium en cada detalle.',
            ],
            [
                'nombre' => 'Samsung',
                'eslogan' => 'Innovacion que te acompana cada dia.',
            ],
            [
                'nombre' => 'Xiaomi',
                'eslogan' => 'Tecnologia top a precio inteligente.',
            ],
            [
                'nombre' => 'One plus',
                'eslogan' => 'Rapido, fluido y sin limites.',
            ],
        ];

        foreach ($marcas as $marca) {
            Marca::updateOrCreate(
                ['nombre' => $marca['nombre']],
                ['eslogan' => $marca['eslogan']]
            );
        }
    }
}
