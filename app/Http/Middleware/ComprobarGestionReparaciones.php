<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ComprobarGestionReparaciones
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->rol, ['admin', 'tecnico'], true)) {
            return redirect()->route('home')
                ->with('error', 'No tienes permisos para acceder.');
        }

        return $next($request);
    }
}
