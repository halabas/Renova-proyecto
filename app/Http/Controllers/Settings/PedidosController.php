<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoProducto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

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

    public function cancelar(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        if (! $user || $pedido->user_id !== $user->id) {
            return redirect()->route('login');
        }

        if ($pedido->estado === 'pagado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'No puedes cancelar un pedido pagado.');
        }

        if ($pedido->estado === 'cancelado') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Este pedido ya está cancelado.');
        }

        $pedido->estado = 'cancelado';
        $pedido->save();

        return redirect()->route('pedidos.index')
            ->with('success', 'Pedido cancelado.');
    }
}
