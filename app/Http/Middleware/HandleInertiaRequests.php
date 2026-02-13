<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\ProductoCarrito;
use App\Models\Movil;
use App\Models\Componente;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
public function share(Request $request): array
{
    [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'quote' => ['message' => trim($message), 'author' => trim($author)],
        'auth' => [
            'user' => $request->user(),
        ],
        'carritoResumen' => function () use ($request) {
            $user = $request->user();
            if (! $user) {
                return [
                    'cantidad' => 0,
                    'subtotal' => 0,
                    'productos' => [],
                ];
            }

            $filas = ProductoCarrito::with('producto')
                ->where('user_id', $user->id)
                ->get();

            $cantidad = 0;
            $subtotal = 0;
            $productos = [];

            foreach ($filas as $fila) {
                $cantidad += $fila->cantidad;
                $subtotal += $fila->precio_unitario * $fila->cantidad;

                $nombre = 'Producto';
                $detalle = null;

                if ($fila->producto_type === Movil::class && $fila->producto) {
                    $modelo = $fila->producto->modelo;
                    $marca = $modelo?->marca?->nombre;
                    $nombre = trim(($marca ? $marca.' ' : '').($modelo?->nombre ?? ''));
                    $detalle = $fila->producto->color.' · '.$fila->producto->grado.' · '.$fila->producto->almacenamiento.'GB';
                }

                if ($fila->producto_type === Componente::class && $fila->producto) {
                    $nombre = $fila->producto->nombre;
                }

                $productos[] = [
                    'id' => $fila->id,
                    'nombre' => $nombre,
                    'detalle' => $detalle,
                    'cantidad' => $fila->cantidad,
                    'precio' => (float) $fila->precio_unitario,
                ];
            }

            return [
                'cantidad' => $cantidad,
                'subtotal' => round($subtotal, 2),
                'productos' => $productos,
            ];
        },
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        'flash' => [
            'success' => fn() => $request->session()->get('success'),
            'error' => fn() => $request->session()->get('error'),
        ],
        'notificaciones' => function () use ($request) {
            $user = $request->user();
            if (! $user) {
                return [
                    'no_leidas' => 0,
                    'items' => [],
                ];
            }

            $items = $user->unreadNotifications()
                ->latest()
                ->limit(8)
                ->get()
                ->map(function ($notification) {
                    $data = (array) $notification->data;
                    return [
                        'id' => $notification->id,
                        'titulo' => $data['titulo'] ?? 'Notificación',
                        'mensaje' => $data['mensaje'] ?? '',
                        'url' => $data['url'] ?? null,
                        'leida' => false,
                        'fecha' => $notification->created_at?->format('d/m/Y H:i'),
                    ];
                })
                ->values();

            return [
                'no_leidas' => (int) $user->unreadNotifications()->count(),
                'items' => $items,
            ];
        },
    ];
}
}
