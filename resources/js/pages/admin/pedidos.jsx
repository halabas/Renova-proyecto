import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

export default function AdminPedidos({ pedidos, resumen, series, rango, anio, anios, filtros }) {
  const [pedidosAbiertos, setPedidosAbiertos] = useState({});

  const formatoTotal = (total) => total.toFixed(2);

  const claseEstado = (estado) => {
    if (estado === 'pagado') {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (estado === 'pendiente') {
      return 'bg-amber-50 text-amber-700';
    }
    if (estado === 'cancelado') {
      return 'bg-red-50 text-red-700';
    }
    return 'bg-slate-100 text-slate-700';
  };

  const claseEnvio = (estado) => {
    if (estado === 'entregado') {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (estado === 'enviado') {
      return 'bg-sky-50 text-sky-700';
    }
    return 'bg-amber-50 text-amber-700';
  };
  const cambiarRango = (nuevoRango) => {
    router.get(
      '/admin/pedidos',
      {
        rango: nuevoRango,
        anio,
        estado: filtros?.estado || 'todos',
        estado_envio: filtros?.estado_envio || 'todos',
        usuario: filtros?.usuario || '',
        fecha_desde: filtros?.fecha_desde || '',
        fecha_hasta: filtros?.fecha_hasta || '',
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const cambiarAnio = (e) => {
    const valor = e.target.value || null;
    router.get(
      '/admin/pedidos',
      {
        rango,
        anio: valor,
        estado: filtros?.estado || 'todos',
        estado_envio: filtros?.estado_envio || 'todos',
        usuario: filtros?.usuario || '',
        fecha_desde: filtros?.fecha_desde || '',
        fecha_hasta: filtros?.fecha_hasta || '',
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    router.get(
      '/admin/pedidos',
      {
        rango,
        anio,
        estado: form.get('estado'),
        estado_envio: form.get('estado_envio'),
        usuario: form.get('usuario'),
        fecha_desde: form.get('fecha_desde'),
        fecha_hasta: form.get('fecha_hasta'),
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
  );

  const labels = (series || []).map((fila) => fila.fecha);
  const data = {
    labels,
    datasets: [
      {
        label: 'Ventas',
        data: (series || []).map((fila) => fila.total),
        borderColor: '#9747ff',
        backgroundColor: 'rgba(151, 71, 255, 0.2)',
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${formatoTotal(context.parsed.y)} €`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { callback: (value) => `${value} €` } },
    },
  };

  return (
    <AppLayout>
      <Head title="Pedidos" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-500">
            Historial completo de pedidos.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={rango === 'hoy' ? 'secondary' : 'outlineGray'}
                onClick={() => cambiarRango('hoy')}
              >
                Hoy
              </Button>
              <Button
                size="sm"
                variant={rango === '7d' ? 'secondary' : 'outlineGray'}
                onClick={() => cambiarRango('7d')}
              >
                7 días
              </Button>
              <Button
                size="sm"
                variant={rango === 'mes' ? 'secondary' : 'outlineGray'}
                onClick={() => cambiarRango('mes')}
              >
                Mes
              </Button>
              <Button
                size="sm"
                variant={rango === 'anio' ? 'secondary' : 'outlineGray'}
                onClick={() => cambiarRango('anio')}
              >
                Año
              </Button>
            </div>
            <div>
              <select
                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={anio || ''}
                onChange={cambiarAnio}
              >
                <option value="">Año actual</option>
                {anios?.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Ventas</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatoTotal(resumen?.total_ventas || 0)} €
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Pedidos</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {resumen?.pedidos || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Ticket medio</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatoTotal(resumen?.ticket_medio || 0)} €
              </p>
            </div>
          </div>

          <div className="mt-6 h-60">
            <Line data={data} options={options} />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <form onSubmit={aplicarFiltros} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Estado de pago</label>
              <select
                name="estado"
                defaultValue={filtros?.estado || 'todos'}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Estado de envío</label>
              <select
                name="estado_envio"
                defaultValue={filtros?.estado_envio || 'todos'}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Usuario</label>
              <input
                name="usuario"
                defaultValue={filtros?.usuario || ''}
                placeholder="Nombre o email"
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Desde</label>
              <input
                type="date"
                name="fecha_desde"
                defaultValue={filtros?.fecha_desde || ''}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Hasta</label>
              <input
                type="date"
                name="fecha_hasta"
                defaultValue={filtros?.fecha_hasta || ''}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm">
                Filtrar
              </Button>
            </div>
          </form>
        </div>

        {pedidos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No hay pedidos registrados.
          </div>
        ) : (
          <div className="space-y-5">
            {pedidos.map((pedido) => {
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
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            Pedido #{pedido.id}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-400">Pago</span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${claseEstado(pedido.estado)}`}>
                              {pedido.estado}
                            </span>
                            {pedido.estado !== 'cancelado' ? (
                              <>
                                <span className="text-slate-400">Envío</span>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${claseEnvio(estadoEnvio)}`}>
                                  {estadoEnvio}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">{pedido.fecha}</p>
                        {pedido.usuario ? (
                          <p className="text-xs text-slate-500">
                            {pedido.usuario.nombre} · {pedido.usuario.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-slate-400">Total</p>
                      <p className="text-xl font-semibold text-slate-900">
                        {formatoTotal(pedido.total)} €
                      </p>
                    </div>
                  </div>

                  {pedido.direccion ? (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Envío:</p>
                      <p>
                        {pedido.direccion.nombre} {pedido.direccion.apellidos} ·{' '}
                        {pedido.direccion.telefono}
                      </p>
                      <p>
                        {pedido.direccion.direccion}, {pedido.direccion.ciudad},{' '}
                        {pedido.direccion.provincia} · {pedido.direccion.codigo_postal}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="space-y-3">
                      {productosVisibles.map((producto) => {
                        const totalProducto = producto.cantidad * producto.precio_unitario;

                        return (
                        <div
                          key={producto.id}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {producto.nombre}
                            </p>
                            {producto.datos ? (
                              <p className="text-xs text-slate-500">
                                {producto.datos.color} · {producto.datos.grado} · {producto.datos.almacenamiento}GB
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div>
                              {producto.cantidad} x {formatoTotal(producto.precio_unitario)} €
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                              {formatoTotal(totalProducto)} €
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    {!estaAbierto && pedido.productos.length > 3 ? (
                      <p className="text-xs text-slate-400">
                        + {pedido.productos.length - 3} productos más
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto]">
                    <div className="flex flex-wrap items-center gap-2">
                      {pedido.estado === 'pagado' && estadoEnvio === 'pendiente' ? (
                        <Button
                          size="sm"
                          variant="outlineGray"
                          onClick={() => router.post(`/admin/pedidos/${pedido.id}/enviar`)}
                        >
                          Marcar como enviado
                        </Button>
                      ) : null}
                      {pedido.estado === 'pagado' ? (
                        <a
                          href={`/admin/pedidos/${pedido.id}/factura`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="secondary">
                            Descargar factura
                          </Button>
                        </a>
                      ) : null}
                    </div>
                    <div className="flex justify-end">
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
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
