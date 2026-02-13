<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Notifications\NotificacionClase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminPedidosController extends Controller
{
    public function index(Request $request)
    {
        $estado = $request->query('estado', 'todos');
        $usuario = $request->query('usuario');
        $estadoEnvio = $request->query('estado_envio', 'todos');
        $fechaDesde = $request->query('fecha_desde');
        $fechaHasta = $request->query('fecha_hasta');

        $consultaListado = Pedido::with(['user', 'productos'])
            ->latest();

        if ($estado && $estado !== 'todos') {
            $consultaListado->where('estado', $estado);
        }

        if ($estadoEnvio && $estadoEnvio !== 'todos') {
            $consultaListado->where('estado_envio', $estadoEnvio);
        }

        if ($usuario) {
            $consultaListado->whereHas('user', function ($query) use ($usuario) {
                $query->where('name', 'ilike', '%'.$usuario.'%')
                    ->orWhere('email', 'ilike', '%'.$usuario.'%');
            });
        }

        if ($fechaDesde || $fechaHasta) {
            $desde = $fechaDesde
                ? Carbon::parse($fechaDesde)->startOfDay()
                : Carbon::create(2020, 1, 1)->startOfDay();
            $hasta = $fechaHasta
                ? Carbon::parse($fechaHasta)->endOfDay()
                : Carbon::now();
            $consultaListado->whereBetween('created_at', [$desde, $hasta]);
        }

        $pedidos = $consultaListado->get()
            ->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'estado' => $pedido->estado,
                    'total' => (float) $pedido->total,
                    'fecha' => $pedido->created_at?->format('d/m/Y H:i'),
                    'estado_envio' => $pedido->estado_envio ?? 'pendiente',
                    'enviado_at' => $pedido->enviado_at?->format('d/m/Y H:i'),
                    'recibido_at' => $pedido->recibido_at?->format('d/m/Y H:i'),
                    'usuario' => [
                        'id' => $pedido->user?->id,
                        'nombre' => $pedido->user?->name,
                        'email' => $pedido->user?->email,
                    ],
                    'direccion' => [
                        'nombre' => $pedido->nombre,
                        'apellidos' => $pedido->apellidos,
                        'telefono' => $pedido->telefono,
                        'direccion' => $pedido->direccion,
                        'ciudad' => $pedido->ciudad,
                        'provincia' => $pedido->provincia,
                        'codigo_postal' => $pedido->codigo_postal,
                    ],
                    'productos' => $pedido->productos->map(function ($producto) {
                        return [
                            'id' => $producto->id,
                            'nombre' => $producto->nombre,
                            'cantidad' => $producto->cantidad,
                            'precio_unitario' => (float) $producto->precio_unitario,
                            'datos' => $producto->datos,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/pedidos', [
            'pedidos' => $pedidos,
            'filtros' => [
                'estado' => $estado,
                'estado_envio' => $estadoEnvio,
                'usuario' => $usuario,
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ],
        ]);
    }

    public function factura(Pedido $pedido)
    {
        if ($pedido->estado !== 'pagado') {
            return redirect()->route('admin.pedidos.index')
                ->with('error', 'Solo puedes descargar facturas de pedidos pagados.');
        }

        $pedido->load('productos');

        $pdf = Pdf::loadView('facturas/pedido', [
            'pedido' => $pedido,
            'productos' => $pedido->productos,
        ]);

        return $pdf->stream('factura-pedido-'.$pedido->id.'.pdf');
    }

    public function enviar(Request $request, Pedido $pedido)
    {
        if ($pedido->estado !== 'pagado') {
            return redirect()->route('admin.pedidos.index')
                ->with('error', 'Solo puedes enviar pedidos pagados.');
        }

        if ($pedido->estado_envio === 'enviado' || $pedido->estado_envio === 'entregado' || $pedido->estado_envio === 'cancelado') {
            return redirect()->route('admin.pedidos.index')
                ->with('error', 'Este pedido ya está enviado.');
        }

        $pedido->estado_envio = 'enviado';
        $pedido->enviado_at = now();
        $pedido->save();

        if ($pedido->user) {
            $pedido->user->notify(new NotificacionClase(
                'Tu pedido ha sido enviado',
                'El pedido #'.$pedido->id.' ya está en camino.',
                '/ajustes/pedidos'
            ));
        }

        return redirect()->route('admin.pedidos.index')
            ->with('success', 'Pedido marcado como enviado.');
    }
}
