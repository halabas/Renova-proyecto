<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PedidosController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\SolicitudReparacionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('ajustes', '/ajustes/perfil');
    Route::redirect('settings', '/ajustes/perfil');

    Route::get('ajustes/perfil', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('ajustes/perfil', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('ajustes/perfil', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('ajustes/contrasena', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('ajustes/contrasena', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('ajustes/pedidos', [PedidosController::class, 'index'])->name('pedidos.index');
    Route::post('ajustes/pedidos/{pedido}/pagar', [PedidosController::class, 'pagar'])->name('pedidos.pagar');
    Route::get('ajustes/pedidos/{pedido}/factura', [PedidosController::class, 'factura'])->name('pedidos.factura');
    Route::post('ajustes/pedidos/{pedido}/devolucion', [PedidosController::class, 'solicitarDevolucion'])->name('pedidos.devolucion');
Route::post('ajustes/pedidos/{pedido}/cancelar', [PedidosController::class, 'cancelar'])->name('pedidos.cancelar');
    Route::post('ajustes/pedidos/{pedido}/recibido', [PedidosController::class, 'marcarRecibido'])->name('pedidos.recibido');
    Route::get('ajustes/reparaciones', [SolicitudReparacionController::class, 'userIndex'])->name('solicitudes-reparacion.user.index');
    Route::post('ajustes/reparaciones/{solicitudReparacion}/presupuesto/aceptar-pagar', [SolicitudReparacionController::class, 'aceptarYPagarPresupuesto'])
        ->name('solicitudes-reparacion.user.presupuesto.aceptar-pagar');
    Route::post('ajustes/reparaciones/{solicitudReparacion}/presupuesto/rechazar', [SolicitudReparacionController::class, 'rechazarPresupuesto'])
        ->name('solicitudes-reparacion.user.presupuesto.rechazar');
    Route::get('ajustes/reparaciones/{solicitudReparacion}/presupuesto/success', [SolicitudReparacionController::class, 'pagoPresupuestoSuccess'])
        ->name('solicitudes-reparacion.user.presupuesto.success');
    Route::post('ajustes/reparaciones/{solicitudReparacion}/recibido', [SolicitudReparacionController::class, 'marcarRecibido'])
        ->name('solicitudes-reparacion.user.recibido');
    Route::get('ajustes/reparaciones/{solicitudReparacion}/factura', [SolicitudReparacionController::class, 'factura'])
        ->name('solicitudes-reparacion.user.factura');

    Route::get('ajustes/doble-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
