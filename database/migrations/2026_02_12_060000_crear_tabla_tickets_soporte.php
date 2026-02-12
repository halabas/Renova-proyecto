<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets_soporte', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tecnico_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('asunto');
            $table->string('categoria', 80);
            $table->string('prioridad', 20)->default('media');
            $table->string('estado', 30)->default('abierto');
            $table->timestamp('cerrado_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets_soporte');
    }
};

