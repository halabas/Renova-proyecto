import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';

const estados = [
  'nueva',
  'en_revision',
  'presupuesto_enviado',
  'aceptada',
  'en_reparacion',
  'finalizada',
  'cancelada',
];

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

export default function SolicitudesReparacionAdmin({ solicitudes, filtroEstado }) {
  return (
    <AppLayout>
      <Head title="Solicitudes reparación" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de reparación</h1>
          <p className="text-sm text-slate-500">Gestión de entradas del taller.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              router.get('/admin/solicitudes-reparacion', {
                estado: form.get('estado'),
              }, { preserveState: true, preserveScroll: true });
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Estado</label>
              <select
                name="estado"
                defaultValue={filtroEstado || 'todos'}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="todos">Todos</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">Filtrar</Button>
          </form>
        </div>

        {solicitudes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No hay solicitudes.
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Solicitud #{solicitud.id} · {solicitud.nombre_completo}
                    </p>
                    <p className="text-xs text-slate-500">{solicitud.fecha}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {solicitud.email} · {solicitud.telefono}
                    </p>
                    {solicitud.usuario ? (
                      <p className="text-xs text-slate-500">
                        Usuario: {solicitud.usuario.nombre}
                      </p>
                    ) : null}
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {estados.map((estado) => (
                    <Button
                      key={estado}
                      size="sm"
                      variant={solicitud.estado === estado ? 'secondary' : 'outlineGray'}
                      onClick={() =>
                        router.patch(`/admin/solicitudes-reparacion/${solicitud.id}/estado`, { estado })
                      }
                    >
                      {estado}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
