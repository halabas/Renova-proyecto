<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->string('producto_type');
            $table->unsignedBigInteger('producto_id');
            $table->string('nombre');
            $table->decimal('precio_unitario', 10, 2);
            $table->integer('cantidad');
            $table->json('datos')->nullable();
            $table->timestamps();

            $table->index(['producto_type', 'producto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_productos');
    }
};
