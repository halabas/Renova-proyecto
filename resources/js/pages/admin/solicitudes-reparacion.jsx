import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SolicitudesReparacionAdmin({ solicitudes, tecnicos = [], filtro = 'mias' }) {
  const { auth } = usePage().props;
  const usuarioActual = auth?.user;
  const esAdmin = usuarioActual?.rol === 'admin';
  const esTecnico = usuarioActual?.rol === 'tecnico';
  const [solicitudModal, setSolicitudModal] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    importe_total: '',
    descripcion: '',
  });

  const aplicarFiltro = (nuevoFiltro) => {
    router.get('/admin/solicitudes-reparacion', { filtro: nuevoFiltro }, { preserveScroll: true });
  };

  const abrirModalPresupuesto = (solicitud) => {
    setSolicitudModal(solicitud);
    reset();
    clearErrors();
    setAbierto(true);
  };

  const enviarPresupuesto = (e) => {
    e.preventDefault();
    if (!solicitudModal) {
      return;
    }
    post(`/admin/solicitudes-reparacion/${solicitudModal.id}/presupuesto`, {
      preserveScroll: true,
      onSuccess: () => {
        setAbierto(false);
        setSolicitudModal(null);
        reset();
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Solicitudes reparación" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de reparación</h1>
          <p className="text-sm text-slate-500">Gestión de entradas del taller.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filtro === 'mias' ? 'default' : 'outlineGray'}
            onClick={() => aplicarFiltro('mias')}
          >
            Mis reparaciones
          </Button>
          <Button
            size="sm"
            variant={filtro === 'pendientes' ? 'default' : 'outlineGray'}
            onClick={() => aplicarFiltro('pendientes')}
          >
            Pendientes
          </Button>
          <Button
            size="sm"
            variant={filtro === 'todas' ? 'default' : 'outlineGray'}
            onClick={() => aplicarFiltro('todas')}
          >
            Todas
          </Button>
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
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {String(solicitud.estado).replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-700">
                  <p><span className="font-medium">Modelo:</span> {solicitud.modelo_dispositivo}</p>
                  <p><span className="font-medium">Problema:</span> {solicitud.tipo_problema}</p>
                  <p><span className="font-medium">Modalidad:</span> {solicitud.modalidad}</p>
                  <p>
                    <span className="font-medium">Técnico a cargo:</span>{' '}
                    {solicitud.tecnico ? solicitud.tecnico.nombre : 'Sin asignar'}
                  </p>
                  {solicitud.descripcion ? (
                    <p><span className="font-medium">Descripción:</span> {solicitud.descripcion}</p>
                  ) : null}
                </div>

                {esAdmin ? (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Asignar técnico:</span>
                    <select
                      className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
                      value={solicitud.tecnico_id || ''}
                      onChange={(e) => {
                        const valor = e.target.value;
                        router.patch(
                          `/admin/solicitudes-reparacion/${solicitud.id}/tecnico`,
                          { tecnico_id: valor === '' ? null : Number(valor) },
                          { preserveScroll: true }
                        );
                      }}
                    >
                      {!solicitud.tecnico_id ? (
                        <option value="" disabled>
                          Selecciona técnico
                        </option>
                      ) : null}
                      {tecnicos.map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {esTecnico && !solicitud.tecnico_id ? (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.post(`/admin/solicitudes-reparacion/${solicitud.id}/aceptar`, {}, { preserveScroll: true })
                      }
                    >
                      Aceptar reparación
                    </Button>
                  </div>
                ) : null}

                {(solicitud.estado === 'asignado' && !solicitud.tiene_presupuesto) &&
                (esAdmin || (esTecnico && solicitud.tecnico_id === usuarioActual?.id)) ? (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => abrirModalPresupuesto(solicitud)}
                    >
                      Crear presupuesto
                    </Button>
                  </div>
                ) : null}

                {solicitud.estado === 'aceptada' && (esAdmin || (esTecnico && solicitud.tecnico_id === usuarioActual?.id)) ? (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.post(
                          `/admin/solicitudes-reparacion/${solicitud.id}/marcar-reparado`,
                          {},
                          { preserveScroll: true }
                        )
                      }
                    >
                      Marcar como reparado
                    </Button>
                  </div>
                ) : null}

                {solicitud.estado === 'rechazada' && (esAdmin || (esTecnico && solicitud.tecnico_id === usuarioActual?.id)) ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outlineGray"
                        size="sm"
                        onClick={() =>
                          router.post(
                            `/admin/solicitudes-reparacion/${solicitud.id}/devolver`,
                            {},
                            { preserveScroll: true }
                          )
                        }
                      >
                        Devolver dispositivo
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          router.post(
                            `/admin/solicitudes-reparacion/${solicitud.id}/enviar`,
                            {},
                            { preserveScroll: true }
                          )
                        }
                      >
                        Marcar como enviado
                      </Button>
                    </div>
                  </div>
                ) : null}

                {(solicitud.estado === 'reparado' || solicitud.estado === 'devuelto') &&
                (esAdmin || (esTecnico && solicitud.tecnico_id === usuarioActual?.id)) ? (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.post(
                          `/admin/solicitudes-reparacion/${solicitud.id}/enviar`,
                          {},
                          { preserveScroll: true }
                        )
                      }
                    >
                      Marcar como enviado
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crear presupuesto</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={enviarPresupuesto}>
            <Input
              label="Importe total"
              type="number"
              min="0"
              step="0.01"
              value={data.importe_total}
              onChange={(e) => setData('importe_total', e.target.value)}
              error={errors.importe_total}
              required
            />
            <Textarea
              label="Descripción"
              value={data.descripcion}
              onChange={(e) => setData('descripcion', e.target.value)}
              error={errors.descripcion}
              required
              className="min-h-28"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={processing}>
                {processing ? 'Guardando...' : 'Guardar presupuesto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
