<?php

namespace App\Http\Controllers;

use App\Models\ProductoCarrito;
use App\Models\Componente;
use App\Models\Direccion;
use App\Models\Modelo;
use App\Models\Movil;
use App\Models\Pedido;
use App\Models\PedidoProducto;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class CarritoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $direcciones = $user->direcciones()
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
            });

        return Inertia::render('carrito/index', [
            'carrito' => $this->logicaCarrito($user->id),
            'direcciones' => $direcciones,
        ]);
    }

    public function store(Request $request)
    {
        // Se comprueba que haya un usuario logeado.
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        // Validacion
        $datos = $request->validate([
            'tipo' => 'required|in:movil,componente',
            'id' => 'required|integer',
            'cantidad' => 'nullable|integer|min:1',
            'variante' => 'nullable|array',
        ]);

        $cantidad = ($datos['cantidad'] !== null ? $datos['cantidad'] : 1);


        // Si es componente:

        if ($datos['tipo'] === 'componente') {
            $componente = Componente::findOrFail($datos['id']);
            if ($componente->stock < $cantidad) {
                throw ValidationException::withMessages([
                    'stock' => ['No hay stock suficiente.'],
                ]);
            }

            // Crea un ProductoCarrito o selecciona el primero existente.
            $producto = ProductoCarrito::firstOrNew([
                'user_id' => $user->id,
                'producto_type' => Componente::class,
                'producto_id' => $componente->id,
            ]);

            $cantidadActual = $producto->cantidad !== null ? $producto->cantidad : 0;
            if ($cantidadActual + $cantidad > $componente->stock) {
                throw ValidationException::withMessages([
                    'stock' => ['No hay stock suficiente.'],
                ]);
            }

            // Actualiza la cantidad y el precio unitario.
            $producto->cantidad = ($producto->cantidad !== null ? $producto->cantidad : 0) + $cantidad;
            $producto->precio_unitario = $componente->precio;
            $producto->save();
        }

        // Si es móvil:

        if ($datos['tipo'] === 'movil') {
            // Obtener el modelo y la variante seleccionada.
            $modelo = Modelo::with('marca')->findOrFail($datos['id']);
            $color = $datos['variante']['color'];
            $grado = $datos['variante']['grado'];
            $almacenamiento = $datos['variante']['almacenamiento'];

            // Buscar el móvil específico según la variante o lanzar error si no existe.
            $movil = Movil::where('modelo_id', $modelo->id)
                ->where('color', $color)
                ->where('grado', $grado)
                ->where('almacenamiento', $almacenamiento)
                ->first();

            if (! $movil) {
                throw ValidationException::withMessages([
                    'variante' => ['Esa variante no está disponible.'],
                ]);
            }

            // Validar stock disponible y calcular precio.

            if ($movil->stock < $cantidad) {
                throw ValidationException::withMessages([
                    'stock' => ['No hay stock suficiente.'],
                ]);
            }

            $precio = $this->precioMovil($modelo->precio_base, $grado, $almacenamiento);

            // Crea un ProductoCarrito o selecciona el primero existente.
            $producto = ProductoCarrito::firstOrNew([
                'user_id' => $user->id,
                'producto_type' => Movil::class,
                'producto_id' => $movil->id,
            ]);

            $cantidadActual = $producto->cantidad !== null ? $producto->cantidad : 0;
            if ($cantidadActual + $cantidad > $movil->stock) {
                throw ValidationException::withMessages([
                    'stock' => ['No hay stock suficiente.'],
                ]);
            }

            // Actualiza la cantidad y el precio unitario.
            $producto->cantidad = ($producto->cantidad !== null ? $producto->cantidad : 0) + $cantidad;
            $producto->precio_unitario = $precio;
            $producto->save();
        }

        return back()->with('success', 'Añadido al carrito.');
    }

    public function update(Request $request, ProductoCarrito $productoCarrito)
    {

        // Se comprueba que haya un usuario logeado.
        $user = $request->user();
        if (! $user || $productoCarrito->user_id !== $user->id) {
            return redirect()->route('login');
        }
        // Validacion
        $data = $request->validate([
            'cantidad' => 'required|integer|min:1',
        ]);

        $stockDisponible = $productoCarrito->producto->stock !== null ? $productoCarrito->producto->stock : 0;
        if ($data['cantidad'] > $stockDisponible) {
            throw ValidationException::withMessages([
                'stock' => ['No hay stock suficiente.'],
            ]);
        }

        // Se actualiza la cantidad del producto en el carrito.

        $productoCarrito->cantidad = $data['cantidad'];
        $productoCarrito->save();

        return back();
    }

    // Borra un producto especifico.
    public function destroy(Request $request, ProductoCarrito $productoCarrito)
    {
        $user = $request->user();
        if (! $user || $productoCarrito->user_id !== $user->id) {
            return redirect()->route('login');
        }

        $productoCarrito->delete();

        return back();
    }

    // Borra todos los productos del usuario.
    public function vaciar(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        ProductoCarrito::where('user_id', $user->id)->delete();

        return back();
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $productosCarrito = ProductoCarrito::with('producto')
            ->where('user_id', $user->id)
            ->get();

        if ($productosCarrito->isEmpty()) {
            return redirect()->route('carrito.index')
                ->with('error', 'Tu carrito está vacío.');
        }

        $direccionId = $request->input('direccion_id');
        if (! $direccionId) {
            return redirect()->route('carrito.index')
                ->with('error', 'Selecciona una dirección de envío.');
        }

        $direccion = Direccion::where('id', $direccionId)
            ->where('user_id', $user->id)
            ->first();

        if (! $direccion) {
            return redirect()->route('carrito.index')
                ->with('error', 'Selecciona una dirección válida.');
        }

        $lineItems = [];
        foreach ($productosCarrito as $producto) {
            $nombre = $this->nombreProducto($producto);
            $descripcion = '';
            if ($producto->producto_type === Movil::class) {
                $descripcion = $producto->producto->color . ' · '
                    . $producto->producto->grado . ' · '
                    . $producto->producto->almacenamiento . 'GB';
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $nombre,
                        'description' => $descripcion,
                    ],
                    'unit_amount' => round($producto->precio_unitario * 100),
                ],
                'quantity' => $producto->cantidad,
            ];
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('carrito.index')
                ->with('error', 'Stripe no está configurado.');
        }

        $total = 0;
        foreach ($productosCarrito as $producto) {
            $total += $producto->precio_unitario * $producto->cantidad;
        }

        $pedido = Pedido::create([
            'user_id' => $user->id,
            'estado' => 'pendiente',
            'total' => round($total, 2),
            'nombre' => $direccion->nombre,
            'apellidos' => $direccion->apellidos,
            'telefono' => $direccion->telefono,
            'direccion' => $direccion->direccion,
            'ciudad' => $direccion->ciudad,
            'provincia' => $direccion->provincia,
            'codigo_postal' => $direccion->codigo_postal,
        ]);

        foreach ($productosCarrito as $producto) {
            $datos = null;
            if ($producto->producto_type === Movil::class) {
                $datos = [
                    'color' => $producto->producto->color,
                    'grado' => $producto->producto->grado,
                    'almacenamiento' => $producto->producto->almacenamiento,
                ];
            }

            PedidoProducto::create([
                'pedido_id' => $pedido->id,
                'producto_type' => $producto->producto_type,
                'producto_id' => $producto->producto_id,
                'nombre' => $this->nombreProducto($producto),
                'precio_unitario' => $producto->precio_unitario,
                'cantidad' => $producto->cantidad,
                'datos' => $datos,
            ]);
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

    public function success(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $sessionId = $request->query('session_id');
        if (! $sessionId) {
            return redirect()->route('carrito.index')
                ->with('error', 'No se pudo confirmar el pago.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return redirect()->route('carrito.index')
                ->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);
        $session = StripeSession::retrieve($sessionId);

        if ($session->payment_status !== 'paid') {
            return redirect()->route('carrito.index')
                ->with('error', 'El pago no se completó.');
        }

        $pedido = Pedido::where('stripe_sesion_id', $session->id)->first();

        if (! $pedido) {
            return redirect()->route('carrito.index')
                ->with('error', 'No se pudo localizar el pedido.');
        }

        if ($pedido->estado !== 'pagado') {
            $pedido->estado = 'pagado';
            $pedido->save();

            $productosPedido = PedidoProducto::where('pedido_id', $pedido->id)->get();

            foreach ($productosPedido as $productoPedido) {
                $producto = $productoPedido->producto;
                if (! $producto) {
                    continue;
                }

                $stockActual = $producto->stock !== null ? $producto->stock : 0;
                $nuevoStock = $stockActual - $productoPedido->cantidad;
                if ($nuevoStock < 0) {
                    $nuevoStock = 0;
                }
                $producto->stock = $nuevoStock;
                $producto->save();
            }

            ProductoCarrito::where('user_id', $user->id)->delete();
        }

        return redirect()->route('carrito.index')
            ->with('success', 'Pago realizado correctamente.');
    }

    public function cancel(Request $request)
    {
        return redirect()->route('carrito.index')
            ->with('error', 'Pago cancelado.');
    }

    private function logicaCarrito(int $userId)
    {
        //filas que devolveran al frontend
        $productos = [];
        $subtotal = 0;
        $cantidad = 0;

        // Obtiene los productos del carrito del usuario

        $filas = ProductoCarrito::with('producto')
            ->where('user_id', $userId)
            ->get();

            // Recorre los productos para sacar los datos de la variante especifica si es un movil.
        foreach ($filas as $producto) {
            $datos = [];
            if ($producto->producto_type === Movil::class) {
                $datos = [
                    'color' => $producto->producto->color,
                    'grado' => $producto->producto->grado,
                    'almacenamiento' => $producto->producto->almacenamiento,
                ];
            }

            // Se prepara cada fila para el frontent con los datos necesarios.
            $fila = [
                'id' => $producto->id,
                'tipo' => $producto->producto_type === Movil::class ? 'movil' : 'componente',
                'nombre' => $this->nombreProducto($producto),
                'precio' => $producto->precio_unitario,
                'cantidad' => $producto->cantidad,
                'datos' => $datos,
                'stock' => $producto->producto->stock !== null ? $producto->producto->stock : 0,
            ];

            // Se añaden al array y se actualizan subtotal y cantidad total.
            $productos[] = $fila;
            $subtotal += $fila['precio'] * $fila['cantidad'];
            $cantidad += $fila['cantidad'];
        }

        return [
            'productos' => $productos,
            'subtotal' => round($subtotal, 2),
            'cantidad' => $cantidad,
        ];
    }

    private function nombreProducto($producto)
    {

        if ($producto->producto_type === Movil::class) {
            $marca = $producto->producto->modelo->marca->nombre;
            $modelo = $producto->producto->modelo;
            return trim($marca . ' ' . ($modelo->nombre));
        }

        if ($producto->producto_type === Componente::class) {
            return $producto->producto->nombre;
        }

        return 'Producto';
    }


    private function precioMovil( $precioBase, $grado, $almacenamiento)
    {
        $descuentoGrado = [
            'S' => 0.05,
            'A+' => 0.15,
            'A' => 0.25,
            'B' => 0.35,
        ][$grado];

        $descuentoCapacidad = [
            128 => 0.15,
            256 => 0.10,
            512 => 0.05,
            1024 => 0.0,
        ][$almacenamiento];

        return round($precioBase * (1 - $descuentoGrado) * (1 - $descuentoCapacidad), 2);
    }
}
