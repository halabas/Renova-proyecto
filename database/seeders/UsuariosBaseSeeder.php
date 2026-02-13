<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsuariosBaseSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            [
                'name' => 'Tecnico Renova',
                'email' => 'tecnico@renova.com',
                'rol' => 'tecnico',
            ],
            [
                'name' => 'Admin Renova',
                'email' => 'admin@renova.com',
                'rol' => 'admin',
            ],
            [
                'name' => 'Cliente Renova',
                'email' => 'cliente@renova.com',
                'rol' => 'cliente',
            ],
        ];

        foreach ($usuarios as $usuario) {
            User::updateOrCreate(
                ['email' => $usuario['email']],
                [
                    'name' => $usuario['name'],
                    'rol' => $usuario['rol'],
                    'password' => 'pablopablo',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
