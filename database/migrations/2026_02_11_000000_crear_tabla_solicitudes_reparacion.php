<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_reparacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('nombre_completo');
            $table->string('telefono', 20);
            $table->string('email');
            $table->string('modelo_dispositivo');
            $table->string('tipo_problema');
            $table->text('descripcion')->nullable();
            $table->string('modalidad', 20);
            $table->string('estado')->default('nueva');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_reparacion');
    }
};
