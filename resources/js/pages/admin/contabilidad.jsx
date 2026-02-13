import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminContabilidad({ resumen, series, rango, anio, anios }) {
  const formato = (valor) => Number(valor || 0).toFixed(2);

  const cambiarRango = (nuevoRango) => {
    router.get(
      '/admin/contabilidad',
      { rango: nuevoRango, anio },
      { preserveState: true, preserveScroll: true }
    );
  };

  const cambiarAnio = (event) => {
    router.get(
      '/admin/contabilidad',
      { rango, anio: event.target.value || null },
      { preserveState: true, preserveScroll: true }
    );
  };

  const labels = (series || []).map((fila) => fila.fecha);
  const data = {
    labels,
    datasets: [
      {
        label: 'Pedidos',
        data: (series || []).map((fila) => fila.pedidos),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 8,
        maxBarThickness: 36,
      },
      {
        label: 'Reparaciones',
        data: (series || []).map((fila) => fila.reparaciones),
        backgroundColor: 'rgba(151, 71, 255, 0.75)',
        borderRadius: 8,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formato(context.parsed.y)} €`,
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
      <Head title="Contabilidad" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Contabilidad</h1>
          <p className="text-sm text-slate-500">
            Ingresos combinados de pedidos y reparaciones.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={rango === 'hoy' ? 'secondary' : 'outlineGray'} onClick={() => cambiarRango('hoy')}>Hoy</Button>
              <Button size="sm" variant={rango === '7d' ? 'secondary' : 'outlineGray'} onClick={() => cambiarRango('7d')}>7 días</Button>
              <Button size="sm" variant={rango === 'mes' ? 'secondary' : 'outlineGray'} onClick={() => cambiarRango('mes')}>Mes</Button>
              <Button size="sm" variant={rango === 'anio' ? 'secondary' : 'outlineGray'} onClick={() => cambiarRango('anio')}>Año</Button>
            </div>
            <select
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700"
              value={anio || ''}
              onChange={cambiarAnio}
            >
              <option value="">Año actual</option>
              {(anios || []).map((valor) => (
                <option key={valor} value={valor}>{valor}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Ingresos totales</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formato(resumen?.total)} €</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Ticket medio</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formato(resumen?.ticket_medio)} €</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Ventas</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {(resumen?.pedidos_count || 0) + (resumen?.reparaciones_count || 0)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Pedidos</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formato(resumen?.pedidos_total)} €</p>
              <p className="mt-1 text-xs text-slate-500">{resumen?.pedidos_count || 0} pedidos</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">Reparaciones</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formato(resumen?.reparaciones_total)} €</p>
              <p className="mt-1 text-xs text-slate-500">{resumen?.reparaciones_count || 0} reparaciones</p>
            </div>
          </div>

          <div className="mt-6 h-64">
            <Bar data={data} options={options} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
