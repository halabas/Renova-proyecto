<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('telefono', 9);
            $table->string('direccion');
            $table->string('ciudad');
            $table->string('provincia');
            $table->string('codigo_postal', 5);
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn([
                'nombre',
                'apellidos',
                'telefono',
                'direccion',
                'ciudad',
                'provincia',
                'codigo_postal',
            ]);
        });
    }
};
