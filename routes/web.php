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
use App\Http\Controllers\BuscarController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\DireccionController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/buscar', [BuscarController::class, 'index'])->name('buscar');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
Route::resource('marcas', MarcaController::class)->except(['show', 'create', 'edit']);
Route::resource('modelos', ModeloController::class)->except(['create','edit']);
Route::resource('moviles', MovilController::class)
    ->except(['create','edit','show'])
    ->parameters(['moviles' => 'movil']);
Route::resource('categorias', CategoriaController::class)
    ->except(['create', 'edit', 'show']);

Route::resource('componentes', ComponenteController::class)
    ->except(['create','edit']);


Route::resource('reparaciones', ReparacionController::class)
    ->except(['create', 'edit', 'show'])
    ->parameters(['reparaciones' => 'reparacion']);

Route::get('admin/reparaciones', [ReparacionController::class, 'admin'])
    ->name('reparaciones.admin');

Route::get('carrito', [CarritoController::class, 'index'])->name('carrito.index');
Route::post('carrito/productos', [CarritoController::class, 'store'])->name('carrito.store');
Route::patch('carrito/productos/{productoCarrito}', [CarritoController::class, 'update'])->name('carrito.update');
Route::delete('carrito/productos/{productoCarrito}', [CarritoController::class, 'destroy'])->name('carrito.destroy');
Route::delete('carrito', [CarritoController::class, 'vaciar'])->name('carrito.vaciar');
Route::post('carrito/checkout', [CarritoController::class, 'checkout'])->name('carrito.checkout');
Route::get('carrito/success', [CarritoController::class, 'success'])->name('carrito.success');
Route::get('carrito/cancel', [CarritoController::class, 'cancel'])->name('carrito.cancel');
Route::post('direcciones', [DireccionController::class, 'store'])->name('direcciones.store');
Route::patch('direcciones/{direccion}', [DireccionController::class, 'update'])->name('direcciones.update');
Route::delete('direcciones/{direccion}', [DireccionController::class, 'destroy'])->name('direcciones.destroy');

require __DIR__.'/settings.php';
