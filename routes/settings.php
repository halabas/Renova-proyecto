<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PedidosController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
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
    Route::post('ajustes/pedidos/{pedido}/cancelar', [PedidosController::class, 'cancelar'])->name('pedidos.cancelar');

    Route::get('ajustes/doble-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
