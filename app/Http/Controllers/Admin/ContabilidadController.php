<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Presupuesto;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContabilidadController extends Controller
{
    public function index(Request $request)
    {
        $rango = $request->query('rango', 'mes');
        $anio = $request->query('anio');

        [$inicio, $fin] = $this->resolverRango($rango, $anio);

        $ventasPedidos = Pedido::query()
            ->where('estado', 'pagado')
            ->whereBetween('created_at', [$inicio, $fin]);

        $ventasReparaciones = Presupuesto::query()
            ->where('estado', 'aceptado')
            ->whereBetween('created_at', [$inicio, $fin]);

        $totalPedidos = (float) $ventasPedidos->sum('total');
        $totalReparaciones = (float) $ventasReparaciones->sum('importe_total');
        $numeroPedidos = (int) $ventasPedidos->count();
        $numeroReparaciones = (int) $ventasReparaciones->count();
        $numeroVentas = $numeroPedidos + $numeroReparaciones;

        $resumen = [
            'total' => round($totalPedidos + $totalReparaciones, 2),
            'pedidos_total' => round($totalPedidos, 2),
            'reparaciones_total' => round($totalReparaciones, 2),
            'pedidos_count' => $numeroPedidos,
            'reparaciones_count' => $numeroReparaciones,
            'ticket_medio' => $numeroVentas > 0
                ? round(($totalPedidos + $totalReparaciones) / $numeroVentas, 2)
                : 0.0,
        ];

        $seriesPedidos = Pedido::query()
            ->selectRaw("DATE(created_at) as fecha, SUM(total) as total")
            ->where('estado', 'pagado')
            ->whereBetween('created_at', [$inicio, $fin])
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        $seriesReparaciones = Presupuesto::query()
            ->selectRaw("DATE(created_at) as fecha, SUM(importe_total) as total")
            ->where('estado', 'aceptado')
            ->whereBetween('created_at', [$inicio, $fin])
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        $mapa = [];
        foreach ($seriesPedidos as $fila) {
            $fecha = Carbon::parse($fila->fecha)->format('Y-m-d');
            $mapa[$fecha] = $mapa[$fecha] ?? ['pedidos' => 0.0, 'reparaciones' => 0.0];
            $mapa[$fecha]['pedidos'] = (float) $fila->total;
        }
        foreach ($seriesReparaciones as $fila) {
            $fecha = Carbon::parse($fila->fecha)->format('Y-m-d');
            $mapa[$fecha] = $mapa[$fecha] ?? ['pedidos' => 0.0, 'reparaciones' => 0.0];
            $mapa[$fecha]['reparaciones'] = (float) $fila->total;
        }

        ksort($mapa);

        $series = collect($mapa)->map(function ($totales, $fecha) {
            return [
                'fecha' => Carbon::parse($fecha)->format('d/m'),
                'pedidos' => round((float) $totales['pedidos'], 2),
                'reparaciones' => round((float) $totales['reparaciones'], 2),
                'total' => round((float) $totales['pedidos'] + (float) $totales['reparaciones'], 2),
            ];
        })->values();

        $aniosDisponibles = Pedido::query()
            ->pluck('created_at')
            ->merge(Presupuesto::query()->pluck('created_at'))
            ->filter()
            ->map(function ($fecha) {
                return Carbon::parse($fecha)->year;
            })
            ->map(fn ($value) => (int) $value)
            ->unique()
            ->sortDesc()
            ->values();

        return Inertia::render('admin/contabilidad', [
            'resumen' => $resumen,
            'series' => $series,
            'rango' => $rango,
            'anio' => $anio ? (int) $anio : null,
            'anios' => $aniosDisponibles,
        ]);
    }

    private function resolverRango(string $rango, $anio): array
    {
        if ($rango === 'hoy') {
            return [Carbon::today(), Carbon::now()];
        }

        if ($rango === '7d') {
            return [Carbon::now()->subDays(6)->startOfDay(), Carbon::now()];
        }

        if ($rango === 'anio') {
            $anioSeleccionado = $anio ? (int) $anio : (int) Carbon::now()->format('Y');
            return [
                Carbon::create($anioSeleccionado, 1, 1)->startOfDay(),
                Carbon::create($anioSeleccionado, 12, 31)->endOfDay(),
            ];
        }

        return [Carbon::now()->startOfMonth(), Carbon::now()];
    }
}
