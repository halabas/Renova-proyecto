<?php

namespace App\Http\Controllers;

use App\Models\TicketMensajeSoporte;
use App\Models\TicketSoporte;
use App\Models\User;
use App\Notifications\NotificacionClase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SoporteController extends Controller
{
    private array $estados = ['abierto', 'resuelto', 'cerrado'];

    public function userIndex(Request $request)
    {
        $user = $request->user();
        $ticketAbiertoInicialId = null;
        $ticketQuery = (int) $request->query('ticket', 0);
        if ($ticketQuery > 0) {
            $existeTicket = TicketSoporte::query()
                ->where('id', $ticketQuery)
                ->where('user_id', $user->id)
                ->exists();
            if ($existeTicket) {
                $ticketAbiertoInicialId = $ticketQuery;
            }
        }

        $tickets = TicketSoporte::query()
            ->with(['tecnico:id,name', 'mensajes.usuario:id,name,rol'])
            ->where('user_id', $user->id)
            ->orderByRaw("CASE estado WHEN 'abierto' THEN 1 WHEN 'resuelto' THEN 2 WHEN 'cerrado' THEN 3 ELSE 4 END")
            ->orderByDesc('created_at')
            ->paginate(6)
            ->through(fn (TicketSoporte $ticket) => $this->mapTicket($ticket))
            ->withQueryString();

        return Inertia::render('settings/soporte', [
            'tickets' => $tickets,
            'categorias' => ['Pedido', 'Reparacion', 'Cuenta', 'Pago', 'Otro'],
            'ticketAbiertoInicialId' => $ticketAbiertoInicialId,
        ]);
    }

    public function userStore(Request $request)
    {
        $user = $request->user();

        $datos = $request->validate([
            'asunto' => ['required', 'string', 'max:120'],
            'categoria' => ['required', 'string', 'max:80'],
            'mensaje' => ['required', 'string', 'max:3000'],
        ]);

        $ticket = TicketSoporte::create([
            'user_id' => $user->id,
            'asunto' => $datos['asunto'],
            'categoria' => $datos['categoria'],
            'prioridad' => 'media',
            'estado' => 'abierto',
        ]);

        TicketMensajeSoporte::create([
            'ticket_soporte_id' => $ticket->id,
            'user_id' => $user->id,
            'mensaje' => $datos['mensaje'],
        ]);

        return back()->with('success', 'Ticket de soporte creado.');
    }

    public function userResponder(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        if ((int) $ticketSoporte->user_id !== (int) $user->id) {
            abort(403);
        }

        if ($ticketSoporte->estado === 'cerrado') {
            return back()->with('error', 'El ticket esta cerrado.');
        }

        $datos = $request->validate([
            'mensaje' => ['required', 'string', 'max:3000'],
        ]);

        TicketMensajeSoporte::create([
            'ticket_soporte_id' => $ticketSoporte->id,
            'user_id' => $user->id,
            'mensaje' => $datos['mensaje'],
        ]);

        if ($ticketSoporte->estado === 'resuelto') {
            $ticketSoporte->estado = 'abierto';
            $ticketSoporte->save();
        }

        return back()->with('success', 'Mensaje enviado.');
    }

    public function userCerrar(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        if ((int) $ticketSoporte->user_id !== (int) $user->id) {
            abort(403);
        }

        if ($ticketSoporte->estado === 'cerrado') {
            return back()->with('error', 'El ticket ya esta cerrado.');
        }

        $ticketSoporte->estado = 'cerrado';
        $ticketSoporte->cerrado_at = now();
        $ticketSoporte->save();

        return back()->with('success', 'Ticket cerrado.');
    }

    public function userConfirmarResolucion(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        if ((int) $ticketSoporte->user_id !== (int) $user->id) {
            abort(403);
        }

        if ($ticketSoporte->estado !== 'resuelto') {
            return back()->with('error', 'Este ticket no esta pendiente de confirmacion.');
        }

        $datos = $request->validate([
            'resuelto' => ['required', 'boolean'],
        ]);

        if ($datos['resuelto']) {
            $ticketSoporte->estado = 'cerrado';
            $ticketSoporte->cerrado_at = now();
            $ticketSoporte->save();

            return back()->with('success', 'Ticket cerrado. Gracias por confirmar.');
        }

        $ticketSoporte->estado = 'abierto';
        $ticketSoporte->cerrado_at = null;
        $ticketSoporte->save();

        return back()->with('success', 'Ticket reabierto.');
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        $filtro = $request->query('filtro', 'mios');
        $estado = $request->query('estado', 'todos');

        $tickets = TicketSoporte::query()
            ->with(['usuario:id,name,email', 'tecnico:id,name', 'mensajes.usuario:id,name,rol'])
            ->when($filtro === 'mios', function ($query) use ($user) {
                $query->where('tecnico_id', $user->id);
            })
            ->when($filtro === 'pendientes', function ($query) {
                $query->whereNull('tecnico_id');
            })
            ->when($estado !== 'todos', function ($query) use ($estado) {
                $query->where('estado', $estado);
            })
            ->latest()
            ->get()
            ->map(fn (TicketSoporte $ticket) => $this->mapTicket($ticket, true));

        $tecnicos = User::query()
            ->whereIn('rol', ['admin', 'tecnico'])
            ->orderBy('name')
            ->get(['id', 'name', 'rol'])
            ->map(fn ($u) => ['id' => $u->id, 'nombre' => $u->name, 'rol' => $u->rol])
            ->values();

        return Inertia::render('admin/soporte', [
            'tickets' => $tickets,
            'tecnicos' => $tecnicos,
            'filtro' => $filtro,
            'estado' => $estado,
            'estados' => $this->estados,
        ]);
    }

    public function adminReclamar(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        if (! in_array($user->rol, ['admin', 'tecnico'], true)) {
            abort(403);
        }

        if ($ticketSoporte->tecnico_id && (int) $ticketSoporte->tecnico_id !== (int) $user->id) {
            return back()->with('error', 'El ticket ya esta asignado a otro responsable.');
        }

        $ticketSoporte->tecnico_id = $user->id;
        $ticketSoporte->save();

        return back()->with('success', 'Ticket reclamado.');
    }

    public function adminAsignar(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        if ($user->rol !== 'admin') {
            abort(403);
        }

        $datos = $request->validate([
            'tecnico_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $tecnico = User::find($datos['tecnico_id']);
        if (! $tecnico || ! in_array($tecnico->rol, ['admin', 'tecnico'], true)) {
            return back()->with('error', 'Solo puedes asignar tickets a responsables válidos.');
        }

        $ticketSoporte->tecnico_id = $tecnico->id;
        $ticketSoporte->save();

        return back()->with('success', 'Responsable actualizado.');
    }

    public function adminEstado(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        $esAdmin = $user->rol === 'admin';
        $esTecnicoAsignado = $user->rol === 'tecnico' && (int) $ticketSoporte->tecnico_id === (int) $user->id;

        if (! $esAdmin && ! $esTecnicoAsignado) {
            abort(403);
        }

        $datos = $request->validate([
            'estado' => ['required', 'string', 'in:abierto,resuelto,cerrado'],
        ]);

        $ticketSoporte->estado = $datos['estado'];
        $ticketSoporte->cerrado_at = $datos['estado'] === 'cerrado' ? now() : null;
        $ticketSoporte->save();

        if ($ticketSoporte->usuario) {
            $ticketSoporte->usuario->notify(new NotificacionClase(
                'Estado de ticket actualizado',
                'Tu ticket #'.$ticketSoporte->id.' ahora está en estado "'.$ticketSoporte->estado.'".',
                '/ajustes/soporte?ticket='.$ticketSoporte->id
            ));
        }

        return back()->with('success', 'Estado actualizado.');
    }

    public function adminResponder(Request $request, TicketSoporte $ticketSoporte)
    {
        $user = $request->user();
        $esAdmin = $user->rol === 'admin';
        $esTecnicoAsignado = $user->rol === 'tecnico' && (int) $ticketSoporte->tecnico_id === (int) $user->id;

        if (! $esAdmin && ! $esTecnicoAsignado) {
            abort(403);
        }

        if ($ticketSoporte->estado === 'cerrado') {
            return back()->with('error', 'No puedes responder en un ticket cerrado.');
        }
        if (! $ticketSoporte->tecnico_id) {
            return back()->with('error', 'Primero asigna el ticket antes de responder.');
        }

        $datos = $request->validate([
            'mensaje' => ['required', 'string', 'max:3000'],
        ]);

        TicketMensajeSoporte::create([
            'ticket_soporte_id' => $ticketSoporte->id,
            'user_id' => $user->id,
            'mensaje' => $datos['mensaje'],
        ]);

        if ($ticketSoporte->usuario) {
            $ticketSoporte->usuario->notify(new NotificacionClase(
                'Nueva respuesta en soporte',
                'Tienes una nueva respuesta en el ticket #'.$ticketSoporte->id.'.',
                '/ajustes/soporte?ticket='.$ticketSoporte->id
            ));
        }

        return back()->with('success', 'Respuesta enviada.');
    }

    private function mapTicket(TicketSoporte $ticket, bool $incluirUsuario = false): array
    {
        return [
            'id' => $ticket->id,
            'asunto' => $ticket->asunto,
            'categoria' => $ticket->categoria,
            'prioridad' => $ticket->prioridad,
            'estado' => $ticket->estado,
            'fecha' => $ticket->created_at?->format('d/m/Y H:i'),
            'tecnico_id' => $ticket->tecnico_id,
            'tecnico' => $ticket->tecnico ? [
                'id' => $ticket->tecnico->id,
                'nombre' => $ticket->tecnico->name,
            ] : null,
            'usuario' => $incluirUsuario && $ticket->usuario ? [
                'id' => $ticket->usuario->id,
                'nombre' => $ticket->usuario->name,
                'email' => $ticket->usuario->email,
            ] : null,
            'mensajes' => $ticket->mensajes
                ->sortBy('created_at')
                ->values()
                ->map(function (TicketMensajeSoporte $mensaje) {
                    return [
                        'id' => $mensaje->id,
                        'mensaje' => $mensaje->mensaje,
                        'fecha' => $mensaje->created_at?->format('d/m/Y H:i'),
                        'usuario' => $mensaje->usuario ? [
                            'id' => $mensaje->usuario->id,
                            'nombre' => $mensaje->usuario->name,
                            'rol' => $mensaje->usuario->rol,
                        ] : null,
                    ];
                }),
        ];
    }
}
