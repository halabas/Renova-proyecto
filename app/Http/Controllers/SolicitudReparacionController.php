<?php

namespace App\Http\Controllers;

use App\Models\Direccion;
use App\Models\SolicitudReparacion;
use App\Models\TicketMensajeSoporte;
use App\Models\TicketSoporte;
use App\Models\User;
use App\Notifications\NotificacionClase;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class SolicitudReparacionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $direcciones = [];

        if ($user) {
            $direcciones = Direccion::where('user_id', $user->id)
                ->orderByDesc('predeterminada')
                ->orderBy('id')
                ->get()
                ->map(function ($direccion) {
                    return [
                        'id' => $direccion->id,
                        'etiqueta' => $direccion->etiqueta,
                        'nombre' => $direccion->nombre,
                        'apellidos' => $direccion->apellidos,
                        'telefono' => $direccion->telefono,
                        'direccion' => $direccion->direccion,
                        'ciudad' => $direccion->ciudad,
                        'provincia' => $direccion->provincia,
                        'codigo_postal' => $direccion->codigo_postal,
                        'predeterminada' => $direccion->predeterminada,
                    ];
                })
                ->values();
        }

        return Inertia::render('reparaciones/index', [
            'direcciones' => $direcciones,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $datos = $request->validate([
            'direccion_id' => ['required', 'integer'],
            'modelo_dispositivo' => ['required', 'string', 'max:255'],
            'tipo_problema' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'modalidad' => ['required', 'in:envio,recogida'],
        ]);

        $direccion = Direccion::where('id', $datos['direccion_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $direccion) {
            return back()->with('error', 'Selecciona una dirección válida.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return back()->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);

        $session = StripeSession::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => 'Revisión y diagnóstico de dispositivo',
                        'description' => 'Pago inicial para solicitud de reparación',
                    ],
                    'unit_amount' => 3000,
                ],
                'quantity' => 1,
            ]],
            'customer_email' => $user->email,
            'success_url' => route('reparaciones.solicitudes.pago-revision.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('reparaciones.index'),
        ]);

        $request->session()->put('solicitud_reparacion_borrador', [
            'user_id' => $user->id,
            'direccion_id' => $direccion->id,
            'modelo_dispositivo' => $datos['modelo_dispositivo'],
            'tipo_problema' => $datos['tipo_problema'],
            'descripcion' => $datos['descripcion'] ?? null,
            'modalidad' => $datos['modalidad'],
            'stripe_session_id' => $session->id,
        ]);

        return Inertia::location($session->url);
    }

    public function revisionPagada(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $borrador = $request->session()->get('solicitud_reparacion_borrador');
        if (! $borrador || ($borrador['user_id'] ?? null) !== $user->id) {
            return redirect()->route('reparaciones.index')->with('error', 'No hay una solicitud pendiente de confirmar.');
        }

        $sessionId = $request->query('session_id');
        if (! $sessionId || $sessionId !== ($borrador['stripe_session_id'] ?? null)) {
            return redirect()->route('reparaciones.index')->with('error', 'No se pudo verificar el pago de revisión.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('reparaciones.index')->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);
        $stripeSession = StripeSession::retrieve($sessionId);

        if ($stripeSession->payment_status !== 'paid') {
            return redirect()->route('reparaciones.index')->with('error', 'El pago de revisión no se completó.');
        }

        $direccion = Direccion::where('id', $borrador['direccion_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $direccion) {
            return redirect()->route('reparaciones.index')->with('error', 'La dirección seleccionada ya no está disponible.');
        }

        SolicitudReparacion::create([
            'user_id' => $user->id,
            'nombre_completo' => trim($direccion->nombre . ' ' . $direccion->apellidos),
            'telefono' => $direccion->telefono,
            'email' => $user->email,
            'modelo_dispositivo' => $borrador['modelo_dispositivo'],
            'tipo_problema' => $borrador['tipo_problema'],
            'descripcion' => $borrador['descripcion'],
            'modalidad' => $borrador['modalidad'],
            'estado' => 'nueva',
        ]);

        $user->notify(new NotificacionClase(
            'Revisión pagada',
            'Hemos recibido el pago de la revisión y tu solicitud de reparación ya está creada.',
            '/ajustes/reparaciones'
        ));

        $request->session()->forget('solicitud_reparacion_borrador');

        return redirect()->route('reparaciones.index')->with('success', 'Pago completado y solicitud creada correctamente.');
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $filtro = $request->query('filtro', 'mias');

        $solicitudes = SolicitudReparacion::with(['user', 'tecnico', 'presupuesto'])
            ->when($filtro === 'mias', function ($query) use ($user) {
                $query->where('tecnico_id', $user->id);
            })
            ->when($filtro === 'pendientes', function ($query) {
                $query->whereNull('tecnico_id');
            })
            ->latest()
            ->get()
            ->map(function ($solicitud) {
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
                'tecnico_id' => $solicitud->tecnico_id,
                'tiene_presupuesto' => $solicitud->presupuesto !== null,
                'tecnico' => $solicitud->tecnico ? [
                    'id' => $solicitud->tecnico->id,
                    'nombre' => $solicitud->tecnico->name,
                ] : null,
                'usuario' => $solicitud->user ? [
                    'id' => $solicitud->user->id,
                    'nombre' => $solicitud->user->name,
                    'email' => $solicitud->user->email,
                ] : null,
            ];
        });

        return Inertia::render('admin/solicitudes-reparacion', [
            'solicitudes' => $solicitudes,
            'filtro' => $filtro,
            'tecnicos' => User::where('rol', 'tecnico')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($u) => ['id' => $u->id, 'nombre' => $u->name])
                ->values(),
        ]);
    }

    public function updateTecnico(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->rol !== 'admin') {
            abort(403);
        }

        $datos = $request->validate([
            'tecnico_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $tecnicoId = $datos['tecnico_id'];

        if ($tecnicoId) {
            $tecnico = User::find($tecnicoId);
            if (! $tecnico || $tecnico->rol !== 'tecnico') {
                return back()->with('error', 'Solo se puede asignar a usuarios con rol técnico.');
            }
        }

        $solicitudReparacion->tecnico_id = $tecnicoId;
        if ($solicitudReparacion->estado === 'nueva') {
            $solicitudReparacion->estado = 'asignado';
        }
        $solicitudReparacion->save();

        if ($solicitudReparacion->user) {
            $solicitudReparacion->user->notify(new NotificacionClase(
                'Reparación asignada',
                'Tu solicitud #'.$solicitudReparacion->id.' ya tiene técnico asignado.',
                '/ajustes/reparaciones'
            ));
        }

        return back()->with('success', 'Técnico actualizado.');
    }

    public function aceptarReparacion(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->rol !== 'tecnico') {
            abort(403);
        }

        if ($solicitudReparacion->tecnico_id &&  $solicitudReparacion->tecnico_id !== $user->id) {
            return back()->with('error', 'Esta solicitud ya está asignada a otro técnico.');
        }

        $solicitudReparacion->tecnico_id = $user->id;
        $solicitudReparacion->estado = 'asignado';
        $solicitudReparacion->save();

        if ($solicitudReparacion->user) {
            $solicitudReparacion->user->notify(new NotificacionClase(
                'Reparación asignada',
                'Tu solicitud #'.$solicitudReparacion->id.' ya está siendo gestionada por un técnico.',
                '/ajustes/reparaciones'
            ));
        }

        return back()->with('success', 'Solicitud aceptada.');
    }

    public function marcarReparado(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $esAdmin = $user->rol === 'admin';
        $esTecnicoAsignado = $user->rol === 'tecnico' && $solicitudReparacion->tecnico_id ===  $user->id;

        if (! $esAdmin && ! $esTecnicoAsignado) {
            abort(403);
        }

        if ($solicitudReparacion->estado !== 'aceptada') {
            return back()->with('error', 'Solo se pueden marcar como reparados los dispositivos con solicitud aceptada.');
        }

        $solicitudReparacion->estado = 'reparado';
        $solicitudReparacion->save();

        if ($solicitudReparacion->user) {
            $solicitudReparacion->user->notify(new NotificacionClase(
                'Dispositivo reparado',
                'Tu solicitud #'.$solicitudReparacion->id.' ya está reparada.',
                '/ajustes/reparaciones'
            ));
        }

        return back()->with('success', 'Dispositivo marcado como reparado.');
    }

    public function devolverDispositivo(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $esAdmin = $user->rol === 'admin';
        $esTecnicoAsignado = $user->rol === 'tecnico' &&  $solicitudReparacion->tecnico_id === $user->id;

        if (! $esAdmin && ! $esTecnicoAsignado) {
            abort(403);
        }

        if ($solicitudReparacion->estado !== 'rechazada') {
            return back()->with('error', 'Solo se puede devolver una solicitud con presupuesto rechazado.');
        }

        $solicitudReparacion->estado = 'devuelto';
        $solicitudReparacion->save();

        if ($solicitudReparacion->user) {
            $solicitudReparacion->user->notify(new NotificacionClase(
                'Dispositivo devuelto',
                'Tu solicitud #'.$solicitudReparacion->id.' ha sido marcada como devuelta.',
                '/ajustes/reparaciones'
            ));
        }

        return back()->with('success', 'Dispositivo marcado como devuelto.');
    }

    public function marcarEnviado(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $esAdmin = $user->rol === 'admin';
        $esTecnicoAsignado = $user->rol === 'tecnico' && $solicitudReparacion->tecnico_id == $user->id;

        if (! $esAdmin && ! $esTecnicoAsignado) {
            abort(403);
        }

        if (! in_array($solicitudReparacion->estado, ['rechazada', 'reparado', 'devuelto'], true)) {
            return back()->with('error', 'Solo se puede marcar envío tras rechazo o reparación finalizada.');
        }

        $solicitudReparacion->estado = 'enviado';
        $solicitudReparacion->save();

        if ($solicitudReparacion->user) {
            $solicitudReparacion->user->notify(new NotificacionClase(
                'Reparación enviada',
                'Tu dispositivo de la solicitud #'.$solicitudReparacion->id.' ha sido enviado.',
                '/ajustes/reparaciones'
            ));
        }

        return back()->with('success', 'Dispositivo marcado como enviado.');
    }

    public function marcarRecibido(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id != $user->id) {
            return redirect()->route('login');
        }

        if ($solicitudReparacion->estado !== 'enviado') {
            return back()->with('error', 'La solicitud aún no está enviada.');
        }

        $solicitudReparacion->estado = 'recibido';
        $solicitudReparacion->save();

        return back()->with('success', 'Solicitud marcada como recibida.');
    }

    public function userIndex(Request $request)
    {
        $user = $request->user();

        $solicitudes = SolicitudReparacion::query()
            ->with('presupuesto')
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
                    'presupuesto' => $solicitud->presupuesto ? [
                        'id' => $solicitud->presupuesto->id,
                        'importe_total' => (float) $solicitud->presupuesto->importe_total,
                        'descripcion' => $solicitud->presupuesto->descripcion,
                        'estado' => $solicitud->presupuesto->estado,
                    ] : null,
                ];
            });

        return Inertia::render('settings/reparaciones', [
            'solicitudes' => $solicitudes,
        ]);
    }

    public function rechazarPresupuesto(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $presupuesto = $solicitudReparacion->presupuesto;
        if (! $presupuesto || $presupuesto->estado !== 'pendiente') {
            return back()->with('error', 'No hay un presupuesto pendiente para rechazar.');
        }

        $presupuesto->estado = 'rechazado';
        $presupuesto->save();

        $solicitudReparacion->estado = 'rechazada';
        $solicitudReparacion->save();

        return back()->with('success', 'Presupuesto rechazado.');
    }

    public function aceptarPresupuesto(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $presupuesto = $solicitudReparacion->presupuesto;
        if (! $presupuesto || $presupuesto->estado !== 'pendiente') {
            return back()->with('error', 'No hay un presupuesto pendiente para aceptar.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return back()->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);

        $session = StripeSession::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => 'Presupuesto reparación',
                        'description' => 'Solicitud #' . $solicitudReparacion->id,
                    ],
                    'unit_amount' => (int) round(((float) $presupuesto->importe_total) * 100),
                ],
                'quantity' => 1,
            ]],
            'customer_email' => $user->email,
            'success_url' => route('solicitudes-reparacion.user.presupuesto.success', $solicitudReparacion) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('solicitudes-reparacion.user.index'),
        ]);

        $request->session()->put('solicitud_reparacion_pago_presupuesto', [
            'solicitud_id' => $solicitudReparacion->id,
            'presupuesto_id' => $presupuesto->id,
            'session_id' => $session->id,
            'user_id' => $user->id,
        ]);

        return Inertia::location($session->url);
    }

    public function presupuestoPagado(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $pagoPendiente = $request->session()->get('solicitud_reparacion_pago_presupuesto');
        if (! $pagoPendiente) {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'No hay pago pendiente de presupuesto.');
        }

        if (
            ($pagoPendiente['user_id'] ?? 0) != $user->id
            || ($pagoPendiente['solicitud_id'] ?? 0) != $solicitudReparacion->id
        ) {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'No se pudo validar el pago del presupuesto.');
        }

        $sessionId = $request->query('session_id');
        if (! $sessionId || $sessionId !== ($pagoPendiente['session_id'] ?? null)) {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'No se pudo verificar el pago en Stripe.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);
        $stripeSession = StripeSession::retrieve($sessionId);

        if ($stripeSession->payment_status !== 'paid') {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'El pago del presupuesto no se completó.');
        }

        $presupuesto = $solicitudReparacion->presupuesto;
        if (! $presupuesto || $presupuesto->id != ($pagoPendiente['presupuesto_id'] ?? 0)) {
            return redirect()->route('solicitudes-reparacion.user.index')->with('error', 'No se encontró el presupuesto a confirmar.');
        }

        $presupuesto->estado = 'aceptado';
        $presupuesto->save();

        $solicitudReparacion->estado = 'aceptada';
        $solicitudReparacion->save();

        $user->notify(new NotificacionClase(
            'Presupuesto aceptado',
            'Tu solicitud #'.$solicitudReparacion->id.' ha quedado aceptada y pagada.',
            '/ajustes/reparaciones'
        ));

        $request->session()->forget('solicitud_reparacion_pago_presupuesto');

        return redirect()->route('solicitudes-reparacion.user.index')->with('success', 'Presupuesto aceptado y pagado correctamente.');
    }

    public function factura(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id != $user->id) {
            return redirect()->route('login');
        }

        $presupuesto = $solicitudReparacion->presupuesto;
        if (! $presupuesto || $presupuesto->estado !== 'aceptado') {
            return redirect()->route('solicitudes-reparacion.user.index')
                ->with('error', 'Solo puedes descargar la factura de presupuestos aceptados y pagados.');
        }

        $pdf = Pdf::loadView('facturas/reparacion', [
            'solicitud' => $solicitudReparacion,
            'presupuesto' => $presupuesto,
        ]);

        return $pdf->stream('factura-reparacion-'.$solicitudReparacion->id.'.pdf');
    }

    public function ayuda(Request $request, SolicitudReparacion $solicitudReparacion)
    {
        $user = $request->user();
        if (! $user || $solicitudReparacion->user_id != $user->id) {
            return redirect()->route('login');
        }

        $asunto = 'Solicitud reparacion #'.$solicitudReparacion->id;

        $ticket = TicketSoporte::query()
            ->where('user_id', $user->id)
            ->where('categoria', 'Reparacion')
            ->where('asunto', $asunto)
            ->where('estado', '!=', 'cerrado')
            ->latest()
            ->first();

        if (! $ticket) {
            $lineas = [];
            $lineas[] = 'Ayuda sobre la solicitud de reparacion #'.$solicitudReparacion->id;
            $lineas[] = 'Estado: '.($solicitudReparacion->estado ?? 'nueva');
            $lineas[] = 'Fecha: '.($solicitudReparacion->created_at?->format('d/m/Y H:i') ?? '-');
            $lineas[] = 'Dispositivo: '.($solicitudReparacion->modelo_dispositivo ?? '-');
            $lineas[] = 'Problema: '.($solicitudReparacion->tipo_problema ?? '-');
            $lineas[] = 'Modalidad: '.($solicitudReparacion->modalidad ?? '-');
            if ($solicitudReparacion->descripcion) {
                $lineas[] = 'Descripcion: '.$solicitudReparacion->descripcion;
            }
            if ($solicitudReparacion->presupuesto) {
                $lineas[] = 'Presupuesto: '.number_format((float) $solicitudReparacion->presupuesto->importe_total, 2, '.', '').' EUR';
                $lineas[] = 'Estado presupuesto: '.$solicitudReparacion->presupuesto->estado;
            }

            $ticket = TicketSoporte::create([
                'user_id' => $user->id,
                'asunto' => $asunto,
                'categoria' => 'Reparacion',
                'prioridad' => 'media',
                'estado' => 'abierto',
            ]);

            TicketMensajeSoporte::create([
                'ticket_soporte_id' => $ticket->id,
                'user_id' => $user->id,
                'mensaje' => implode("\n", $lineas),
            ]);
        }

        return redirect('/ajustes/soporte?ticket='.$ticket->id)
            ->with('success', 'Ticket de ayuda listo.');
    }
}
