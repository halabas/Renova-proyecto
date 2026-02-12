import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, ChevronRight, Package } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Pedidos',
        href: '/ajustes/pedidos',
    },
];

export default function Orders({ pedidos }) {
    const [pedidosAbiertos, setPedidosAbiertos] = useState({});
    const [modalDevolucionAbierto, setModalDevolucionAbierto] = useState(false);
    const [pedidoDevolucion, setPedidoDevolucion] = useState(null);
    const [pedidoAyuda, setPedidoAyuda] = useState(null);
    const {
        data: formDevolucion,
        setData: setFormDevolucion,
        post: enviarDevolucion,
        processing: enviandoDevolucion,
        errors: erroresDevolucion,
        reset: resetDevolucion,
        clearErrors,
    } = useForm({
        motivo: '',
        comentario: '',
    });
    const estadoClasses = (estado) => {
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

    const estadoEnvioClasses = (estado) => {
        const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold';
        if (estado === 'entregado') {
            return `${base} bg-emerald-50 text-emerald-700`;
        }
        if (estado === 'enviado') {
            return `${base} bg-sky-50 text-sky-700`;
        }
        return `${base} bg-amber-50 text-amber-700`;
    };

    const formatoTotal = (total) => total.toFixed(2);

    const abrirModalDevolucion = (pedido) => {
        setPedidoDevolucion(pedido);
        setFormDevolucion({
            motivo: '',
            comentario: '',
        });
        clearErrors();
        setModalDevolucionAbierto(true);
    };

    const cerrarModalDevolucion = () => {
        setModalDevolucionAbierto(false);
        setPedidoDevolucion(null);
        resetDevolucion();
    };

    const puedeSolicitarDevolucion = (pedido) => {
        if (pedido.estado !== 'pagado' || pedido.devolucion) {
            return false;
        }
        if (!pedido.created_at) {
            return false;
        }
        const limite =
            new Date(pedido.created_at).getTime() + 14 * 24 * 60 * 60 * 1000;
        return Date.now() <= limite;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            <SettingsLayout>
                <Dialog
                    open={modalDevolucionAbierto}
                    onOpenChange={(abierto) =>
                        abierto ? setModalDevolucionAbierto(true) : cerrarModalDevolucion()
                    }
                >
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Solicitar devolución</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="motivo">Motivo</Label>
                                <select
                                    id="motivo"
                                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                    value={formDevolucion.motivo}
                                    onChange={(e) =>
                                        setFormDevolucion('motivo', e.target.value)
                                    }
                                >
                                    <option value="">Selecciona un motivo</option>
                                    <option value="No cumple mis expectativas">
                                        No cumple mis expectativas
                                    </option>
                                    <option value="Me he arrepentido de la compra">
                                        Me he arrepentido de la compra
                                    </option>
                                    <option value="Producto defectuoso">
                                        Producto defectuoso
                                    </option>
                                    <option value="Otro motivo">
                                        Otro motivo
                                    </option>
                                </select>
                                <InputError message={erroresDevolucion.motivo} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="comentario">Comentario (opcional)</Label>
                                <Textarea
                                    id="comentario"
                                    value={formDevolucion.comentario}
                                    onChange={(e) =>
                                        setFormDevolucion('comentario', e.target.value)
                                    }
                                    placeholder="Cuéntanos más detalles"
                                />
                                <InputError message={erroresDevolucion.comentario} />
                            </div>
                            <p className="text-xs text-slate-500">
                                Se rechazarán productos con signos de uso, manipulados o bajo criterio de la empresa.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outlineGray"
                                    size="sm"
                                    onClick={cerrarModalDevolucion}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={!pedidoDevolucion || enviandoDevolucion}
                                    onClick={() => {
                                        if (!pedidoDevolucion) {
                                            return;
                                        }
                                        enviarDevolucion(
                                            `/ajustes/pedidos/${pedidoDevolucion.id}/devolucion`,
                                            {
                                                onSuccess: cerrarModalDevolucion,
                                            }
                                        );
                                    }}
                                >
                                    Enviar solicitud
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={pedidoAyuda !== null}
                    onOpenChange={(abierto) => {
                        if (!abierto) {
                            setPedidoAyuda(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>¿Necesitas ayuda con tu pedido?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-slate-600">
                            Abriremos un ticket de soporte con la información del pedido para
                            ayudarte más rápido.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outlineGray"
                                onClick={() => setPedidoAyuda(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    if (!pedidoAyuda) {
                                        return;
                                    }
                                    router.post(
                                        `/ajustes/pedidos/${pedidoAyuda}/ayuda`,
                                        {},
                                    );
                                    setPedidoAyuda(null);
                                }}
                            >
                                Abrir ticket
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

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
                                    const estadoEnvio = pedido.estado === 'cancelado'
                                        ? 'cancelado'
                                        : (pedido.estado_envio || 'pendiente');
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
                                                    {pedido.estado !== 'cancelado' ? (
                                                        <span className={estadoEnvioClasses(estadoEnvio)}>
                                                            {estadoEnvio}
                                                        </span>
                                                    ) : null}
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

                                    <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto]">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(pedido.estado === 'pendiente' ||
                                              (pedido.estado === 'pagado' &&
                                                pedido.estado_envio === 'pendiente')) ? (
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
                                            {pedido.estado === 'pagado' ? (
                                                <a
                                                    href={`/ajustes/pedidos/${pedido.id}/factura`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Button size="sm" variant="secondary">
                                                        Descargar factura
                                                    </Button>
                                                </a>
                                            ) : null}
                                            {pedido.estado === 'pagado' &&
                                            estadoEnvio === 'enviado' ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outlineGray"
                                                    onClick={() =>
                                                        router.post(
                                                            `/ajustes/pedidos/${pedido.id}/recibido`,
                                                        )
                                                    }
                                                >
                                                    Marcar como recibido
                                                </Button>
                                            ) : null}
                                            {pedido.devolucion ? (
                                                <span className="text-xs text-slate-500">
                                                    Devolución: {pedido.devolucion.estado}
                                                </span>
                                            ) : null}
                                            {pedido.estado === 'pagado' &&
                                            !pedido.devolucion &&
                                            pedido.created_at &&
                                            new Date(pedido.created_at).getTime() + 14 * 24 * 60 * 60 * 1000 < Date.now() ? (
                                                <span className="text-xs text-slate-500">
                                                    El plazo de devolución ha terminado. Para tramitar garantía escribe a Renova@support.com
                                                </span>
                                            ) : null}
                                            {pedido.estado_envio === 'entregado' && puedeSolicitarDevolucion(pedido) ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outlineGray"
                                                    onClick={() => abrirModalDevolucion(pedido)}
                                                >
                                                    Solicitar devolución
                                                </Button>
                                            ) : null}
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
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setPedidoAyuda(pedido.id)}
                                            >
                                                Ayuda
                                            </Button>
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
