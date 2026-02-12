import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const estadoClase = (estado) => {
  if (estado === 'abierto') return 'bg-slate-100 text-slate-700';
  if (estado === 'resuelto') return 'bg-emerald-50 text-emerald-700';
  if (estado === 'cerrado') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

export default function SoporteUsuario({ tickets, categorias, ticketAbiertoInicialId = null }) {
  const listaTickets = Array.isArray(tickets) ? tickets : (tickets?.data || []);
  const paginaActual = tickets?.current_page || 1;
  const totalPaginas = tickets?.last_page || 1;
  const paginaAnterior = tickets?.prev_page_url;
  const paginaSiguiente = tickets?.next_page_url;
  const [respuestas, setRespuestas] = useState({});
  const [ticketAbiertoId, setTicketAbiertoId] = useState(null);
  const [modalNuevoTicketAbierto, setModalNuevoTicketAbierto] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    asunto: '',
    categoria: categorias?.[0] || 'Otro',
    mensaje: '',
  });

  useEffect(() => {
    if (!ticketAbiertoInicialId) {
      return;
    }

    const existe = listaTickets.some((ticket) => ticket.id === ticketAbiertoInicialId);
    if (existe) {
      setTicketAbiertoId(ticketAbiertoInicialId);
    }
  }, [ticketAbiertoInicialId, listaTickets]);

  return (
    <AppLayout>
      <Head title="Soporte" />
      <SettingsLayout>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Soporte</h3>
            <p className="text-sm text-slate-500">
              Crea tickets y habla con nuestro equipo.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setModalNuevoTicketAbierto(true)}>
                Nuevo ticket
              </Button>
            </div>
          </div>

          <Dialog open={modalNuevoTicketAbierto} onOpenChange={setModalNuevoTicketAbierto}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Nuevo ticket</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  post('/ajustes/soporte', {
                    preserveScroll: true,
                    onSuccess: () => {
                      reset('asunto', 'mensaje');
                      setModalNuevoTicketAbierto(false);
                    },
                  });
                }}
              >
                <Input
                  label="Asunto"
                  value={data.asunto}
                  onChange={(e) => setData('asunto', e.target.value)}
                  error={errors.asunto}
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    value={data.categoria}
                    onChange={(e) => setData('categoria', e.target.value)}
                  >
                    {(categorias || []).map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                  <InputError message={errors.categoria} />
                </div>
                <Textarea
                  label="Mensaje"
                  value={data.mensaje}
                  onChange={(e) => setData('mensaje', e.target.value)}
                  error={errors.mensaje}
                  required
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={processing}>
                    {processing ? 'Enviando...' : 'Crear ticket'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={ticketAbiertoId !== null} onOpenChange={(abierto) => !abierto && setTicketAbiertoId(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {ticketAbiertoId
                    ? `Ticket #${ticketAbiertoId} · ${
                        listaTickets.find((ticket) => ticket.id === ticketAbiertoId)?.asunto || ''
                      }`
                    : 'Ticket'}
                </DialogTitle>
              </DialogHeader>

              {ticketAbiertoId ? (
                (() => {
                  const ticket = listaTickets.find((item) => item.id === ticketAbiertoId);
                  if (!ticket) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{ticket.fecha}</span>
                        <span>·</span>
                        <span>{ticket.categoria}</span>
                        <span>·</span>
                        <span>Responsable: {ticket.tecnico ? ticket.tecnico.nombre : 'Sin asignar'}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(ticket.estado)}`}
                        >
                          {ticket.estado.replaceAll('_', ' ')}
                        </span>
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

                      {ticket.estado === 'resuelto' ? (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">Se resolvio tu duda?</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.post(
                                  `/ajustes/soporte/${ticket.id}/confirmar-resolucion`,
                                  { resuelto: true },
                                  { preserveScroll: true },
                                )
                              }
                            >
                              Si, cerrar ticket
                            </Button>
                            <Button
                              size="sm"
                              variant="outlineGray"
                              onClick={() =>
                                router.post(
                                  `/ajustes/soporte/${ticket.id}/confirmar-resolucion`,
                                  { resuelto: false },
                                  { preserveScroll: true },
                                )
                              }
                            >
                              No, volver a abierto
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {ticket.estado !== 'cerrado' && ticket.estado !== 'resuelto' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={respuestas[ticket.id] || ''}
                            onChange={(e) =>
                              setRespuestas((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                            }
                            placeholder="Escribe tu mensaje..."
                            className="min-h-20"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.post(
                                  `/ajustes/soporte/${ticket.id}/responder`,
                                  { mensaje: respuestas[ticket.id] || '' },
                                  {
                                    preserveScroll: true,
                                    onSuccess: () =>
                                      setRespuestas((prev) => ({ ...prev, [ticket.id]: '' })),
                                  },
                                )
                              }
                            >
                              Enviar mensaje
                            </Button>
                            <Button
                              size="sm"
                              variant="outlineGray"
                              onClick={() =>
                                router.post(`/ajustes/soporte/${ticket.id}/cerrar`, {}, { preserveScroll: true })
                              }
                            >
                              Cerrar ticket
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              ) : null}
            </DialogContent>
          </Dialog>

          {listaTickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Aun no tienes tickets de soporte.
            </div>
          ) : (
            <div className="space-y-4">
              {listaTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Ticket #{ticket.id} · {ticket.asunto}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ticket.fecha} · {ticket.categoria}
                      </p>
                      <p className="text-xs text-slate-500">
                        Responsable: {ticket.tecnico ? ticket.tecnico.nombre : 'Sin asignar'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(ticket.estado)}`}>
                      {ticket.estado.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setTicketAbiertoId(ticket.id)}
                    >
                      Abrir chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!Array.isArray(tickets) && totalPaginas > 1 ? (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <Button
                size="sm"
                variant="outlineGray"
                disabled={!paginaAnterior}
                onClick={() => paginaAnterior && router.get(paginaAnterior, {}, { preserveScroll: true })}
              >
                Anterior
              </Button>
              <p className="text-sm text-slate-600">
                Pagina {paginaActual} de {totalPaginas}
              </p>
              <Button
                size="sm"
                variant="outlineGray"
                disabled={!paginaSiguiente}
                onClick={() => paginaSiguiente && router.get(paginaSiguiente, {}, { preserveScroll: true })}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
