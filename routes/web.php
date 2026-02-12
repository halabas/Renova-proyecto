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
use App\Http\Controllers\DevolucionController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\AdminPedidosController;
use App\Http\Controllers\PresupuestoController;
use App\Http\Controllers\SolicitudReparacionController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/buscar', [BuscarController::class, 'index'])->name('buscar');

Route::middleware(['auth', 'verified'])->group(function () {
});
Route::get('modelos/{modelo}', [ModeloController::class, 'show'])->name('modelos.show');
Route::get('componentes/{componente}', [ComponenteController::class, 'show'])->name('componentes.show');
Route::get('reparaciones', [ReparacionController::class, 'index'])->name('reparaciones.index');
Route::middleware('auth')->group(function () {
    Route::post('reparaciones/solicitudes', [SolicitudReparacionController::class, 'store'])
        ->name('reparaciones.solicitudes.store');
    Route::get('reparaciones/solicitudes/pago-revision/success', [SolicitudReparacionController::class, 'pagoRevisionSuccess'])
        ->name('reparaciones.solicitudes.pago-revision.success');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
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
        ->except(['create', 'edit', 'show','index'])
        ->parameters(['reparaciones' => 'reparacion']);

    Route::get('reparaciones', [ReparacionController::class, 'admin'])
        ->name('reparaciones.admin');
    Route::get('usuarios', [UsuarioController::class, 'index'])
        ->name('usuarios.index');
    Route::delete('usuarios/{user}', [UsuarioController::class, 'destroy'])
        ->name('usuarios.destroy');
    Route::get('pedidos', [AdminPedidosController::class, 'index'])
        ->name('admin.pedidos.index');
    Route::get('pedidos/{pedido}/factura', [AdminPedidosController::class, 'factura'])
        ->name('admin.pedidos.factura');
    Route::post('pedidos/{pedido}/enviar', [AdminPedidosController::class, 'enviar'])
        ->name('admin.pedidos.enviar');
    Route::get('devoluciones', [DevolucionController::class, 'index'])
        ->name('devoluciones.index');
    Route::post('devoluciones/{devolucion}/aprobar', [DevolucionController::class, 'aprobar'])
        ->name('devoluciones.aprobar');
    Route::post('devoluciones/{devolucion}/rechazar', [DevolucionController::class, 'rechazar'])
        ->name('devoluciones.rechazar');
    Route::post('devoluciones/{devolucion}/reembolsar', [DevolucionController::class, 'reembolsar'])
        ->name('devoluciones.reembolsar');
});

Route::middleware(['auth', 'gestion_reparaciones'])->prefix('admin')->group(function () {
    Route::get('solicitudes-reparacion', [SolicitudReparacionController::class, 'adminIndex'])
        ->name('admin.solicitudes-reparacion.index');
    Route::patch('solicitudes-reparacion/{solicitudReparacion}/tecnico', [SolicitudReparacionController::class, 'updateTecnico'])
        ->name('admin.solicitudes-reparacion.update-tecnico');
    Route::post('solicitudes-reparacion/{solicitudReparacion}/aceptar', [SolicitudReparacionController::class, 'aceptarReparacion'])
        ->name('admin.solicitudes-reparacion.aceptar');
    Route::post('solicitudes-reparacion/{solicitudReparacion}/marcar-reparado', [SolicitudReparacionController::class, 'marcarReparado'])
        ->name('admin.solicitudes-reparacion.marcar-reparado');
    Route::post('solicitudes-reparacion/{solicitudReparacion}/devolver', [SolicitudReparacionController::class, 'devolverDispositivo'])
        ->name('admin.solicitudes-reparacion.devolver');
    Route::post('solicitudes-reparacion/{solicitudReparacion}/enviar', [SolicitudReparacionController::class, 'marcarEnviado'])
        ->name('admin.solicitudes-reparacion.enviar');
    Route::post('solicitudes-reparacion/{solicitudReparacion}/presupuesto', [PresupuestoController::class, 'store'])
        ->name('admin.solicitudes-reparacion.presupuesto.store');
});

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
