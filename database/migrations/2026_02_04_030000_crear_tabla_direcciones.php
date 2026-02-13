<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('direcciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('etiqueta', 50)->default('Casa');
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('dni', 9)->nullable();
            $table->string('telefono', 9);
            $table->string('direccion');
            $table->string('ciudad');
            $table->string('provincia');
            $table->string('codigo_postal', 5);
            $table->boolean('predeterminada')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('direcciones');
    }
};
