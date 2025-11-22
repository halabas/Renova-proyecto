<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\ModeloController;
use App\Http\Controllers\MovilController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ComponenteController;
use App\Http\Controllers\ReparacionController;


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
Route::resource('marcas', MarcaController::class)->except(['show', 'create', 'edit']);
Route::resource('modelos', ModeloController::class)->except(['create','edit','show']);
Route::resource('moviles', MovilController::class)
    ->except(['create','edit','show'])
    ->parameters(['moviles' => 'movil']);
Route::resource('categorias', CategoriaController::class)
    ->except(['create', 'edit', 'show']);

Route::resource('componentes', ComponenteController::class)
    ->except(['create','edit','show']);


Route::resource('reparaciones', ReparacionController::class)
    ->except(['create', 'edit', 'show'])
    ->parameters(['reparaciones' => 'reparacion']);

require __DIR__.'/settings.php';
