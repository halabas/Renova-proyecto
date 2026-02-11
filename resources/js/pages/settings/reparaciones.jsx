import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';

const estadoClase = (estado) => {
  if (estado === 'nueva') return 'bg-slate-100 text-slate-700';
  if (estado === 'en_revision') return 'bg-amber-50 text-amber-700';
  if (estado === 'presupuesto_enviado') return 'bg-sky-50 text-sky-700';
  if (estado === 'aceptada') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'en_reparacion') return 'bg-violet-50 text-violet-700';
  if (estado === 'finalizada') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'cancelada') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

export default function ReparacionesUsuario({ solicitudes }) {
  return (
    <AppLayout>
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
                <div key={solicitud.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Solicitud #{solicitud.id}
                      </p>
                      <p className="text-xs text-slate-500">{solicitud.fecha}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-700">
                    <p><span className="font-medium">Modelo:</span> {solicitud.modelo_dispositivo}</p>
                    <p><span className="font-medium">Problema:</span> {solicitud.tipo_problema}</p>
                    <p><span className="font-medium">Modalidad:</span> {solicitud.modalidad}</p>
                    {solicitud.descripcion ? (
                      <p><span className="font-medium">Descripción:</span> {solicitud.descripcion}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
