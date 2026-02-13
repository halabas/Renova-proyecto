<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            'Pantallas',
            'Baterias',
            'Camaras',
            'Altavoces',
        ];

        foreach ($categorias as $nombre) {
            Categoria::updateOrCreate(
                ['nombre' => $nombre],
                ['nombre' => $nombre]
            );
        }
    }
}
