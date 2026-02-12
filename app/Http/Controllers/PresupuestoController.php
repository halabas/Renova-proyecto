<?php

namespace App\Http\Controllers;

use App\Models\Presupuesto;
use App\Models\SolicitudReparacion;
use Illuminate\Http\Request;

class PresupuestoController extends Controller
{
    public function store(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        if (! in_array($user->rol, ['admin', 'tecnico'], true)) {
            abort(403);
        }

        if ($user->rol === 'tecnico' && (int) $solicitudReparacion->tecnico_id !== (int) $user->id) {
            return back()->with('error', 'Solo puedes crear presupuesto para solicitudes asignadas a ti.');
        }

        if ($solicitudReparacion->estado !== 'asignado') {
            return back()->with('error', 'Solo puedes crear presupuesto en solicitudes asignadas.');
        }

        if (Presupuesto::where('solicitud_reparacion_id', $solicitudReparacion->id)->exists()) {
            return back()->with('error', 'Esta solicitud ya tiene presupuesto.');
        }

        $datos = $request->validate([
            'importe_total' => ['required', 'numeric', 'min:0'],
            'descripcion' => ['required', 'string', 'max:2500'],
        ]);

        Presupuesto::create([
            'solicitud_reparacion_id' => $solicitudReparacion->id,
            'tecnico_id' => $user->id,
            'importe_total' => $datos['importe_total'],
            'descripcion' => $datos['descripcion'],
            'estado' => 'pendiente',
        ]);

        $solicitudReparacion->estado = 'presupuesto_enviado';
        $solicitudReparacion->save();

        return back()->with('success', 'Presupuesto creado correctamente.');
    }
}
