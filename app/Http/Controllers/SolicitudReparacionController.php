<?php

namespace App\Http\Controllers;

use App\Models\SolicitudReparacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SolicitudReparacionController extends Controller
{
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre_completo' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'modelo_dispositivo' => ['required', 'string', 'max:255'],
            'tipo_problema' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'modalidad' => ['required', 'in:envio,recogida'],
        ]);

        SolicitudReparacion::create([
            ...$datos,
            'user_id' => $request->user()?->id,
            'estado' => 'nueva',
        ]);

        return back()->with('success', 'Solicitud enviada correctamente.');
    }

    public function adminIndex(Request $request)
    {
        $estado = $request->query('estado', 'todos');

        $consulta = SolicitudReparacion::with('user')->latest();
        if ($estado !== 'todos') {
            $consulta->where('estado', $estado);
        }

        $solicitudes = $consulta->get()->map(function ($solicitud) {
            return [
                'id' => $solicitud->id,
                'estado' => $solicitud->estado,
                'nombre_completo' => $solicitud->nombre_completo,
                'telefono' => $solicitud->telefono,
                'email' => $solicitud->email,
                'modelo_dispositivo' => $solicitud->modelo_dispositivo,
                'tipo_problema' => $solicitud->tipo_problema,
                'descripcion' => $solicitud->descripcion,
                'modalidad' => $solicitud->modalidad,
                'fecha' => $solicitud->created_at?->format('d/m/Y H:i'),
                'usuario' => $solicitud->user ? [
                    'id' => $solicitud->user->id,
                    'nombre' => $solicitud->user->name,
                    'email' => $solicitud->user->email,
                ] : null,
            ];
        });

        return Inertia::render('admin/solicitudes-reparacion', [
            'solicitudes' => $solicitudes,
            'filtroEstado' => $estado,
        ]);
    }

    public function updateEstado(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $datos = $request->validate([
            'estado' => [
                'required',
                'in:nueva,en_revision,presupuesto_enviado,aceptada,en_reparacion,finalizada,cancelada',
            ],
        ]);

        $solicitudReparacion->estado = $datos['estado'];
        $solicitudReparacion->save();

        return back()->with('success', 'Estado actualizado.');
    }

    public function userIndex(Request $request)
    {
        $user = $request->user();

        $solicitudes = SolicitudReparacion::query()
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($solicitud) {
                return [
                    'id' => $solicitud->id,
                    'estado' => $solicitud->estado,
                    'modelo_dispositivo' => $solicitud->modelo_dispositivo,
                    'tipo_problema' => $solicitud->tipo_problema,
                    'descripcion' => $solicitud->descripcion,
                    'modalidad' => $solicitud->modalidad,
                    'fecha' => $solicitud->created_at?->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('settings/reparaciones', [
            'solicitudes' => $solicitudes,
        ]);
    }
}
