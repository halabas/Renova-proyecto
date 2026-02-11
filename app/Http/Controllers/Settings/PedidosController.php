<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Devolucion;
use App\Models\Pedido;
use App\Models\PedidoProducto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;
use Stripe\Refund;
use Barryvdh\DomPDF\Facade\Pdf;

class PedidosController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $pedidos = Pedido::with('productos')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'estado' => $pedido->estado,
                    'total' => (float) $pedido->total,
                    'fecha' => $pedido->created_at?->format('d/m/Y H:i'),
                    'created_at' => $pedido->created_at?->toIso8601String(),
                    'estado_envio' => $pedido->estado_envio,
                    'enviado_at' => $pedido->enviado_at?->format('d/m/Y H:i'),
                    'recibido_at' => $pedido->recibido_at?->format('d/m/Y H:i'),
                    'productos' => $pedido->productos->map(function ($producto) {
                        return [
                            'id' => $producto->id,
                            'nombre' => $producto->nombre,
                            'cantidad' => $producto->cantidad,
                            'precio_unitario' => (float) $producto->precio_unitario,
                            'datos' => $producto->datos,
                        ];
                    }),
                    'devolucion' => $pedido->devolucion ? [
                        'id' => $pedido->devolucion->id,
                        'estado' => $pedido->devolucion->estado,
                        'motivo' => $pedido->devolucion->motivo,
                        'comentario' => $pedido->devolucion->comentario,
                        'fecha' => $pedido->devolucion->created_at?->format('d/m/Y H:i'),
                    ] : null,
                ];
            });

        return Inertia::render('settings/pedidos', [
            'pedidos' => $pedidos,
        ]);
    }

    public function pagar(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado === 'pagado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido ya está pagado.');
        }

        if ($pedido->estado === 'cancelado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido está cancelado.');
        }

        $productos = PedidoProducto::where('pedido_id', $pedido->id)->get();
        if ($productos->isEmpty()) {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido no tiene productos.');
        }

        $lineItems = [];
        foreach ($productos as $producto) {
            $descripcion = '';
            if (is_array($producto->datos)) {
                $partes = array_filter([
                    $producto->datos['color'] ?? null,
                    $producto->datos['grado'] ?? null,
                    isset($producto->datos['almacenamiento']) ? $producto->datos['almacenamiento'].'GB' : null,
                ]);
                $descripcion = implode(' · ', $partes);
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $producto->nombre,
                        'description' => $descripcion,
                    ],
                    'unit_amount' => round($producto->precio_unitario * 100),
                ],
                'quantity' => $producto->cantidad,
            ];
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('pedidos.index')
                ->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);

        $session = StripeSession::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'customer_email' => $user->email,
            'success_url' => route('carrito.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('carrito.cancel'),
        ]);

        $pedido->stripe_sesion_id = $session->id;
        $pedido->save();

        return Inertia::location($session->url);
    }

    public function factura(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado !== 'pagado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo puedes descargar facturas de pedidos pagados.');
        }

        $pedido->load('productos');

        $pdf = Pdf::loadView('facturas/pedido', [
            'pedido' => $pedido,
            'productos' => $pedido->productos,
        ]);

        return $pdf->stream('factura-pedido-'.$pedido->id.'.pdf');
    }

    public function solicitarDevolucion(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado !== 'pagado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo puedes solicitar devoluciones de pedidos pagados.');
        }

        if ($pedido->estado_envio !== 'entregado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo puedes solicitar devoluciones de pedidos entregados.');
        }

        if ($pedido->devolucion) {
            return redirect()->route('pedidos.index')
                ->with('error', 'Ya hay una devolución registrada para este pedido.');
        }

        if ($pedido->created_at && $pedido->created_at->lt(now()->subDays(14))) {
            return redirect()->route('pedidos.index')
                ->with('error', 'El plazo de devolución ha expirado.');
        }

        $datos = $request->validate([
            'motivo' => ['required', 'string', 'max:100'],
            'comentario' => ['nullable', 'string', 'max:1000'],
        ]);

        Devolucion::create([
            'pedido_id' => $pedido->id,
            'user_id' => $user->id,
            'motivo' => $datos['motivo'],
            'comentario' => $datos['comentario'] ?? null,
            'estado' => 'pendiente',
        ]);

        return redirect()->route('pedidos.index')
            ->with('success', 'Solicitud de devolución enviada.');
    }

    public function cancelar(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado === 'cancelado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido ya está cancelado.');
        }

        if ($pedido->estado === 'pagado') {
            if ($pedido->estado_envio !== 'pendiente') {
                return redirect()->route('pedidos.index')
                    ->with('error', 'No puedes cancelar un pedido ya enviado.');
            }

            if (! $pedido->stripe_sesion_id) {
                return redirect()->route('pedidos.index')
                    ->with('error', 'No se encontró información de pago.');
            }

            $secret = config('services.stripe.secret');
            if (! $secret) {
                return redirect()->route('pedidos.index')
                    ->with('error', 'Stripe no está configurado.');
            }

            Stripe::setApiKey($secret);
            $session = StripeSession::retrieve($pedido->stripe_sesion_id);
            $paymentIntentId = $session->payment_intent;

            if (! $paymentIntentId) {
                return redirect()->route('pedidos.index')
                    ->with('error', 'No se pudo localizar el pago.');
            }

            Refund::create([
                'payment_intent' => $paymentIntentId,
            ]);
        }

        $pedido->estado = 'cancelado';
        $pedido->save();

        return redirect()->route('pedidos.index')
            ->with('success', 'Pedido cancelado.');
    }

    public function marcarRecibido(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado !== 'pagado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo puedes confirmar pedidos pagados.');
        }

        if ($pedido->estado_envio !== 'enviado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido aún no está en reparto.');
        }

        $pedido->estado_envio = 'entregado';
        $pedido->recibido_at = now();
        $pedido->save();

        return redirect()->route('pedidos.index')
            ->with('success', 'Pedido marcado como recibido.');
    }
}
