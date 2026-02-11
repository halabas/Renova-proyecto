<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('estado')->default('pendiente');
            $table->string('estado_envio')->default('pendiente');
            $table->decimal('total', 10, 2)->default(0);
            $table->string('stripe_sesion_id')->nullable()->unique();
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('telefono', 9);
            $table->string('direccion');
            $table->string('ciudad');
            $table->string('provincia');
            $table->string('codigo_postal', 5);
            $table->timestamp('enviado_at')->nullable();
            $table->timestamp('recibido_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
