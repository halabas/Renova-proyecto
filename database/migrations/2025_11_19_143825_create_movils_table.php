<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('moviles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modelo_id')->constrained('modelos')->cascadeOnDelete();
            $table->string('color');
            $table->enum('grado', ['S', 'A+', 'A', 'B']);
            $table->integer('almacenamiento');
            $table->integer('stock')->default(0);
            $table->unique(['modelo_id', 'color', 'grado', 'almacenamiento']);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moviles');
    }
};
