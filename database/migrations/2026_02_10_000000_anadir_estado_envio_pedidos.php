<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('estado_envio')->default('pendiente');
            $table->timestamp('enviado_at')->nullable();
            $table->timestamp('recibido_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['estado_envio', 'enviado_at', 'recibido_at']);
        });
    }
};
