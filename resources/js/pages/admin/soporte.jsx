import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const estadoClase = (estado) => {
  if (estado === 'abierto') return 'bg-slate-100 text-slate-700';
  if (estado === 'resuelto') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'cerrado') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

export default function SoporteAdmin({ tickets, tecnicos, filtro, estado, estados }) {
  const { auth } = usePage().props;
  const [respuestas, setRespuestas] = useState({});
  const [ticketAbiertoId, setTicketAbiertoId] = useState(null);
  const user = auth?.user;
  const esAdmin = user?.rol === 'admin';

  const aplicarFiltros = (nuevoFiltro, nuevoEstado) => {
    router.get('/admin/soporte', { filtro: nuevoFiltro, estado: nuevoEstado }, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Soporte admin" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Soporte</h1>
          <p className="text-sm text-slate-500">Gestion de tickets de cliente.</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <Button size="sm" variant={filtro === 'mios' ? 'default' : 'outlineGray'} onClick={() => aplicarFiltros('mios', estado)}>
            Mis tickets
          </Button>
          <Button size="sm" variant={filtro === 'pendientes' ? 'default' : 'outlineGray'} onClick={() => aplicarFiltros('pendientes', estado)}>
            Pendientes
          </Button>
          <Button size="sm" variant={filtro === 'todos' ? 'default' : 'outlineGray'} onClick={() => aplicarFiltros('todos', estado)}>
            Todos
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-600">Estado:</span>
            <select
              className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
              value={estado}
              onChange={(e) => aplicarFiltros(filtro, e.target.value)}
            >
              <option value="todos">Todos</option>
              {(estados || []).map((item) => (
                <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No hay tickets.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Ticket #{ticket.id} · {ticket.asunto}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ticket.fecha} · {ticket.categoria}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cliente: {ticket.usuario?.nombre} ({ticket.usuario?.email})
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(ticket.estado)}`}>
                    {ticket.estado.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {ticket.tecnico ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      Responsable: {ticket.tecnico.nombre}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                      Sin asignar
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outlineGray"
                    onClick={() => setTicketAbiertoId(ticket.id)}
                  >
                    Abrir chat
                  </Button>

                  {!ticket.tecnico_id ? (
                    <Button
                      size="sm"
                      onClick={() => router.post(`/admin/soporte/${ticket.id}/reclamar`, {}, { preserveScroll: true })}
                    >
                      Reclamar ticket
                    </Button>
                  ) : null}

                  {esAdmin ? (
                    <select
                      className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
                      value={ticket.tecnico_id || ''}
                      onChange={(e) =>
                        router.patch(
                          `/admin/soporte/${ticket.id}/asignar`,
                          { tecnico_id: Number(e.target.value) },
                          { preserveScroll: true },
                        )
                      }
                    >
                      <option value="" disabled>Asignar responsable</option>
                      {(tecnicos || []).map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre} ({tecnico.rol})
                        </option>
                      ))}
                    </select>
                  ) : null}

                  <select
                    className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
                    value={ticket.estado}
                    onChange={(e) =>
                      router.patch(
                        `/admin/soporte/${ticket.id}/estado`,
                        { estado: e.target.value },
                        { preserveScroll: true },
                      )
                    }
                  >
                    {(estados || []).map((item) => (
                      <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={ticketAbiertoId !== null} onOpenChange={(abierto) => !abierto && setTicketAbiertoId(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {ticketAbiertoId
                ? `Ticket #${ticketAbiertoId} · ${
                    tickets.find((ticket) => ticket.id === ticketAbiertoId)?.asunto || ''
                  }`
                : 'Ticket'}
            </DialogTitle>
          </DialogHeader>

          {ticketAbiertoId ? (
            (() => {
              const ticket = tickets.find((item) => item.id === ticketAbiertoId);
              if (!ticket) return null;

              return (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Cliente: {ticket.usuario?.nombre} ({ticket.usuario?.email})
                  </div>

                  <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
                    {ticket.mensajes.map((mensaje) => (
                      <div key={mensaje.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-xs text-slate-500">
                          {mensaje.usuario?.nombre || 'Usuario'} · {mensaje.fecha}
                        </p>
                        <p className="text-sm text-slate-700">{mensaje.mensaje}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.estado !== 'cerrado' && ticket.tecnico_id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={respuestas[ticket.id] || ''}
                        onChange={(e) =>
                          setRespuestas((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                        }
                        placeholder="Responder al cliente..."
                        className="min-h-20"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          router.post(
                            `/admin/soporte/${ticket.id}/responder`,
                            { mensaje: respuestas[ticket.id] || '' },
                            {
                              preserveScroll: true,
                              onSuccess: () =>
                                setRespuestas((prev) => ({ ...prev, [ticket.id]: '' })),
                            },
                          )
                        }
                      >
                        Enviar respuesta
                      </Button>
                    </div>
                  ) : null}

                  {ticket.estado !== 'cerrado' && !ticket.tecnico_id ? (
                    <p className="text-xs text-amber-700">
                      Asigna el ticket antes de responder al cliente.
                    </p>
                  ) : null}
                </div>
              );
            })()
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
