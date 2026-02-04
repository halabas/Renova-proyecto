import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, ChevronRight, Package } from 'lucide-react';

type PedidoProducto = {
    id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    datos: {
        color?: string;
        grado?: string;
        almacenamiento?: number;
    } | null;
};

type Pedido = {
    id: number;
    estado: string;
    total: number;
    fecha: string | null;
    productos: PedidoProducto[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: '/ajustes/pedidos',
    },
];

export default function Orders({ pedidos }: { pedidos: Pedido[] }) {
    const [pedidosAbiertos, setPedidosAbiertos] = useState<Record<number, boolean>>({});
    const estadoClasses = (estado: string) => {
        const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold';
        if (estado === 'pagado') {
            return `${base} bg-emerald-50 text-emerald-700`;
        }
        if (estado === 'pendiente') {
            return `${base} bg-amber-50 text-amber-700`;
        }
        if (estado === 'cancelado') {
            return `${base} bg-red-50 text-red-700`;
        }
        return `${base} bg-slate-100 text-slate-700`;
    };

    const formatoTotal = (total: number) => total.toFixed(2);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Pedidos
                        </h3>
                        <p className="text-sm text-slate-500">
                            Historial de pedidos realizados.
                        </p>
                    </div>

                    {pedidos.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                            Aún no tienes pedidos.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {pedidos.map((pedido) => (
                                (() => {
                                    const estaAbierto = Boolean(pedidosAbiertos[pedido.id]);
                                    const productosVisibles = estaAbierto
                                        ? pedido.productos
                                        : pedido.productos.slice(0, 3);

                                    return (
                                <div
                                    key={pedido.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        PEDIDO #{pedido.id}
                                                    </p>
                                                    <span className={estadoClasses(pedido.estado)}>
                                                        {pedido.estado}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {pedido.fecha || '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Total
                                            </p>
                                            <p className="text-xl font-semibold text-slate-900">
                                                {formatoTotal(pedido.total)} €
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                                        {productosVisibles.map((producto) => {
                                            const totalProducto =
                                                producto.cantidad * producto.precio_unitario;
                                            return (
                                                <div
                                                    key={producto.id}
                                                    className="flex flex-wrap items-center justify-between gap-4"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {producto.nombre}
                                                        </p>
                                                        {producto.datos ? (
                                                            <p className="text-xs text-slate-500">
                                                                {producto.datos.color}{' '}
                                                                ·{' '}
                                                                {producto.datos.grado}{' '}
                                                                ·{' '}
                                                                {producto.datos.almacenamiento}
                                                                GB
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-right text-sm text-slate-600">
                                                        <div>
                                                            {producto.cantidad} x{' '}
                                                            {formatoTotal(
                                                                producto.precio_unitario,
                                                            )}{' '}
                                                            €
                                                        </div>
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            {formatoTotal(totalProducto)} €
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {!estaAbierto && pedido.productos.length > 3 ? (
                                            <p className="text-xs text-slate-400">
                                                + {pedido.productos.length - 3} productos más
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {pedido.estado === 'pendiente' ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outlineGray"
                                                    onClick={() =>
                                                        router.post(
                                                            `/ajustes/pedidos/${pedido.id}/cancelar`,
                                                        )
                                                    }
                                                >
                                                    Cancelar pedido
                                                </Button>
                                            ) : null}
                                        </div>
                                        {pedido.estado === 'pendiente' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        `/ajustes/pedidos/${pedido.id}/pagar`,
                                                    )
                                                }
                                            >
                                                Pagar pedido
                                            </Button>
                                        ) : null}
                                        {pedido.productos.length > 3 ? (
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
                                                onClick={() =>
                                                    setPedidosAbiertos((prev) => ({
                                                        ...prev,
                                                        [pedido.id]: !estaAbierto,
                                                    }))
                                                }
                                            >
                                                {estaAbierto ? 'Ver menos' : 'Ver pedido completo'}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                    );
                                })()
                            ))}
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
