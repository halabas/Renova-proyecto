import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { Calendar, Wrench } from 'lucide-react';

const breadcrumbs = [
  {
    title: 'Reparaciones',
    href: '/ajustes/reparaciones',
  },
];

const estadoClase = (estado) => {
  if (estado === 'nueva') return 'bg-slate-100 text-slate-700';
  if (estado === 'en_revision') return 'bg-amber-50 text-amber-700';
  if (estado === 'presupuesto_enviado') return 'bg-sky-50 text-sky-700';
  if (estado === 'aceptada') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'en_reparacion') return 'bg-violet-50 text-violet-700';
  if (estado === 'finalizada') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'cancelada') return 'bg-red-50 text-red-700';
  if (estado === 'asignado') return 'bg-amber-50 text-amber-700';
  if (estado === 'rechazada') return 'bg-red-50 text-red-700';
  if (estado === 'reparado') return 'bg-violet-50 text-violet-700';
  if (estado === 'devuelto') return 'bg-amber-50 text-amber-700';
  if (estado === 'enviado') return 'bg-sky-50 text-sky-700';
  if (estado === 'recibido') return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
};

const estadoPresupuestoClase = (estado) => {
  if (estado === 'pendiente') return 'bg-amber-50 text-amber-700';
  if (estado === 'aceptado') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'rechazado') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

export default function ReparacionesUsuario({ solicitudes }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mis reparaciones" />
      <SettingsLayout>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Mis reparaciones</h3>
            <p className="text-sm text-slate-500">
              Seguimiento de todas tus solicitudes.
            </p>
          </div>

          {solicitudes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Aún no tienes solicitudes de reparación.
            </div>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          SOLICITUD #{solicitud.id}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          {solicitud.fecha || '—'}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(solicitud.estado)}`}>
                      {String(solicitud.estado).replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {solicitud.modelo_dispositivo}
                        </p>
                        <p className="text-xs text-slate-500">
                          Problema: {solicitud.tipo_problema}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Modalidad: <span className="font-medium text-slate-700">{solicitud.modalidad}</span>
                      </p>
                    </div>
                    {solicitud.descripcion ? (
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Descripción:</span> {solicitud.descripcion}
                      </p>
                    ) : null}
                  </div>

                  {solicitud.presupuesto ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">Presupuesto</p>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoPresupuestoClase(solicitud.presupuesto.estado)}`}>
                          {String(solicitud.presupuesto.estado).replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {Number(solicitud.presupuesto.importe_total).toFixed(2)} €
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-medium">Detalle:</span> {solicitud.presupuesto.descripcion}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {solicitud.presupuesto.estado === 'pendiente' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                router.post(
                                  `/ajustes/reparaciones/${solicitud.id}/presupuesto/aceptar-pagar`,
                                  {},
                                  { preserveScroll: true }
                                )
                              }
                            >
                              Aceptar y pagar
                            </Button>
                            <Button
                              size="sm"
                              variant="outlineGray"
                              onClick={() =>
                                router.post(
                                  `/ajustes/reparaciones/${solicitud.id}/presupuesto/rechazar`,
                                  {},
                                  { preserveScroll: true }
                                )
                              }
                            >
                              Rechazar
                            </Button>
                          </>
                        ) : null}

                        {solicitud.presupuesto.estado === 'aceptado' ? (
                          <a
                            href={`/ajustes/reparaciones/${solicitud.id}/factura`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button size="sm" variant="secondary">
                              Descargar factura
                            </Button>
                          </a>
                        ) : null}

                        {solicitud.estado === 'enviado' ? (
                          <Button
                            size="sm"
                            variant="outlineGray"
                            onClick={() =>
                              router.post(
                                `/ajustes/reparaciones/${solicitud.id}/recibido`,
                                {},
                                { preserveScroll: true }
                              )
                            }
                          >
                            Marcar como recibido
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
