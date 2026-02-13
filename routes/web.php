<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\ModeloController;
use App\Http\Controllers\MovilController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ComponenteController;
use App\Http\Controllers\BuscarController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\DireccionController;
use App\Http\Controllers\DevolucionController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\AdminPedidosController;
use App\Http\Controllers\Admin\ContabilidadController;
use App\Http\Controllers\PresupuestoController;
use App\Http\Controllers\SolicitudReparacionController;
use App\Http\Controllers\SoporteController;
use App\Http\Controllers\NotificacionesController;
//RUTA HOME
Route::get('/', [HomeController::class, 'index'])->name('home');

// Ruta Buscar
Route::get('/buscar', [BuscarController::class, 'index'])->name('buscar');

Route::get('/nuestra-historia', function () {
    return Inertia::render('info/nuestra-historia');
})->name('info.historia');

Route::get('/politica-de-privacidad', function () {
    return Inertia::render('info/politica-privacidad');
})->name('info.privacidad');

Route::get('/terminos-y-condiciones', function () {
    return Inertia::render('info/terminos-condiciones');
})->name('info.terminos');

Route::middleware(['auth', 'verified'])->group(function () {
});
Route::get('modelos/{modelo}', [ModeloController::class, 'show'])->name('modelos.show');
Route::get('componentes/{componente}', [ComponenteController::class, 'show'])->name('componentes.show');
Route::get('reparaciones', [SolicitudReparacionController::class, 'index'])->name('reparaciones.index');
Route::middleware('auth')->group(function () {
    Route::post('reparaciones/solicitudes', [SolicitudReparacionController::class, 'store'])
        ->name('reparaciones.solicitudes.store');
    Route::get('reparaciones/solicitudes/pago-revision/success', [SolicitudReparacionController::class, 'revisionPagada'])
        ->name('reparaciones.solicitudes.pago-revision.success');
    Route::post('notificaciones/{id}/leer', [NotificacionesController::class, 'leer'])
        ->name('notificaciones.leer');
    Route::post('notificaciones/leer-todas', [NotificacionesController::class, 'leerTodas'])
        ->name('notificaciones.leer-todas');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {

    // RESOURCES BASICOS

    Route::resource('marcas', MarcaController::class)->except(['show', 'create', 'edit']);
    Route::resource('modelos', ModeloController::class)->except(['create','edit','show']);
    Route::resource('moviles', MovilController::class)
        ->except(['create','edit','show'])
        ->parameters(['moviles' => 'movil']);
    Route::resource('categorias', CategoriaController::class)
        ->except(['create', 'edit', 'show']);
    Route::resource('componentes', ComponenteController::class)
        ->except(['create','edit','show']);

    // RUTAS DE USUARIOS
    Route::get('usuarios', [UsuarioController::class, 'index'])
        ->name('usuarios.index');
    Route::patch('usuarios/{user}/rol', [UsuarioController::class, 'actualizarRol'])
        ->name('usuarios.rol');
    Route::delete('usuarios/{user}', [UsuarioController::class, 'destroy'])
        ->name('usuarios.destroy');

    // RUTAS DE PEDIDOS
    Route::get('pedidos', [AdminPedidosController::class, 'index'])
        ->name('admin.pedidos.index');
    Route::get('contabilidad', [ContabilidadController::class, 'index'])
        ->name('admin.contabilidad.index');
    Route::get('pedidos/{pedido}/factura', [AdminPedidosController::class, 'factura'])
        ->name('admin.pedidos.factura');
    Route::post('pedidos/{pedido}/enviar', [AdminPedidosController::class, 'enviar'])
        ->name('admin.pedidos.enviar');

    // RUTAS DE DEVOLUCIONES
    Route::get('devoluciones', [DevolucionController::class, 'index'])
        ->name('devoluciones.index');
    Route::post('devoluciones/{devolucion}/aprobar', [DevolucionController::class, 'aprobar'])
        ->name('devoluciones.aprobar');
    Route::post('devoluciones/{devolucion}/rechazar', [DevolucionController::class, 'rechazar'])
        ->name('devoluciones.rechazar');
    Route::post('devoluciones/{devolucion}/reembolsar', [DevolucionController::class, 'reembolsar'])
        ->name('devoluciones.reembolsar');
});
// RUTAS DE ADMINISTRACIÓN DE REPARACIONES Y SOPORTE
Route::middleware(['auth', 'gestion_reparaciones'])->prefix('admin')->group(function () {

    // RUTAS DE SOLICITUDES DE REPARACIÓN
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

    // RUTAS DE SOPORTE
    Route::get('soporte', [SoporteController::class, 'adminIndex'])
        ->name('admin.soporte.index');
    Route::post('soporte/{ticketSoporte}/reclamar', [SoporteController::class, 'adminReclamar'])
        ->name('admin.soporte.reclamar');
    Route::patch('soporte/{ticketSoporte}/asignar', [SoporteController::class, 'adminAsignar'])
        ->name('admin.soporte.asignar');
    Route::patch('soporte/{ticketSoporte}/estado', [SoporteController::class, 'adminEstado'])
        ->name('admin.soporte.estado');
    Route::post('soporte/{ticketSoporte}/responder', [SoporteController::class, 'adminResponder'])
        ->name('admin.soporte.responder');
});
// RUTAS DE CARRITO
Route::get('carrito', [CarritoController::class, 'index'])->name('carrito.index');
Route::post('carrito/productos', [CarritoController::class, 'store'])->name('carrito.store');
Route::patch('carrito/productos/{productoCarrito}', [CarritoController::class, 'update'])->name('carrito.update');
Route::delete('carrito/productos/{productoCarrito}', [CarritoController::class, 'destroy'])->name('carrito.destroy');
Route::delete('carrito', [CarritoController::class, 'vaciar'])->name('carrito.vaciar');
Route::post('carrito/checkout', [CarritoController::class, 'checkout'])->name('carrito.checkout');
Route::get('carrito/success', [CarritoController::class, 'success'])->name('carrito.success');
Route::get('carrito/cancel', [CarritoController::class, 'cancel'])->name('carrito.cancel');

// RUTAS DE DIRECCIONES
Route::post('direcciones', [DireccionController::class, 'store'])->name('direcciones.store');
Route::patch('direcciones/{direccion}', [DireccionController::class, 'update'])->name('direcciones.update');
Route::delete('direcciones/{direccion}', [DireccionController::class, 'destroy'])->name('direcciones.destroy');

require __DIR__.'/settings.php';
