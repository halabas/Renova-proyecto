import { router, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/renova-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import InputError from "@/components/input-error";

export default function Carrito({ carrito, direcciones = [] }) {
  const productos = carrito.productos;
  const direccionPorDefecto = useMemo(
    () => direcciones.find((d) => d.predeterminada) || direcciones[0],
    [direcciones]
  );
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(
    direccionPorDefecto?.id || null
  );
  const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);
  const [direccionEditando, setDireccionEditando] = useState(null);
  const {
    data: formDireccion,
    setData: setFormDireccion,
    post: guardarDireccion,
    patch: actualizarDireccion,
    processing: creandoDireccion,
    reset: resetDireccion,
    errors: erroresDireccion,
    clearErrors,
  } = useForm({
    etiqueta: "Casa",
    nombre: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    predeterminada: false,
  });

  const abrirModalDireccion = (direccion = null) => {
    if (direccion) {
      setDireccionEditando(direccion.id);
      setFormDireccion({
        etiqueta: direccion.etiqueta || "Casa",
        nombre: direccion.nombre || "",
        apellidos: direccion.apellidos || "",
        telefono: direccion.telefono || "",
        direccion: direccion.direccion || "",
        ciudad: direccion.ciudad || "",
        provincia: direccion.provincia || "",
        codigo_postal: direccion.codigo_postal || "",
        predeterminada: Boolean(direccion.predeterminada),
      });
    } else {
      setDireccionEditando(null);
      resetDireccion();
      setFormDireccion("etiqueta", "Casa");
    }
    clearErrors();
    setModalDireccionAbierto(true);
  };
  const maxDirecciones = 3;
  const puedeCrearDireccion = direcciones.length < maxDirecciones;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Tu carrito</h1>
          {productos.length > 0 && (
            <Button
              type="button"
              variant="outlineGray"
              size="sm"
              onClick={() => router.delete("/carrito")}
            >
              Vaciar carrito
            </Button>
          )}
        </div>

        {productos.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            Tu carrito está vacío.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {productos.map((producto) => (
              <div key={producto.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {producto.nombre}
                  </p>
                  {producto.tipo === 'movil' && (
                    <p className="text-sm text-slate-500">
                      {producto.datos.color} · {producto.datos.grado} · {producto.datos.almacenamiento}GB
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={producto.stock}
                    defaultValue={producto.cantidad}
                    className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                    onBlur={(e) =>
                      router.patch(`/carrito/productos/${producto.id}`, {
                        cantidad: (() => {
                        return e.target.value = Math.min(Math.max(Number(e.target.value), 1), producto.stock);

                        })(),
                      })
                    }
                  />
                  <span className="text-sm text-slate-700">
                    {(producto.precio * producto.cantidad).toFixed(2)} €
                  </span>
                  <Button
                    type="button"
                    variant="delete"
                    size="sm"
                    onClick={() => router.delete(`/carrito/productos/${producto.id}`)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Dirección de envío
              </h2>
              <p className="text-sm text-slate-500">
                Elige la dirección donde quieres recibir el pedido.
              </p>
            </div>
            <Dialog open={modalDireccionAbierto} onOpenChange={setModalDireccionAbierto}>
              <DialogTrigger asChild>
                <Button
                  variant="outlineGray"
                  size="sm"
                  disabled={!puedeCrearDireccion}
                  onClick={() => abrirModalDireccion()}
                >
                  Añadir dirección
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>
                    {direccionEditando ? "Editar dirección" : "Nueva dirección"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="etiqueta">Etiqueta</Label>
                    <Input
                      id="etiqueta"
                      value={formDireccion.etiqueta}
                      onChange={(e) =>
                        setFormDireccion("etiqueta", e.target.value)
                      }
                      placeholder="Casa / Trabajo"
                    />
                    <InputError message={erroresDireccion.etiqueta} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={formDireccion.nombre}
                        onChange={(e) =>
                          setFormDireccion("nombre", e.target.value)
                        }
                      />
                      <InputError message={erroresDireccion.nombre} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={formDireccion.apellidos}
                        onChange={(e) =>
                          setFormDireccion("apellidos", e.target.value)
                        }
                      />
                      <InputError message={erroresDireccion.apellidos} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formDireccion.telefono}
                      onChange={(e) =>
                        setFormDireccion("telefono", e.target.value)
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9}
                      placeholder="Ej: 600000000"
                    />
                    <InputError message={erroresDireccion.telefono} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formDireccion.direccion}
                      onChange={(e) =>
                        setFormDireccion("direccion", e.target.value)
                      }
                      placeholder="Calle y número"
                    />
                    <InputError message={erroresDireccion.direccion} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        value={formDireccion.ciudad}
                        onChange={(e) =>
                          setFormDireccion("ciudad", e.target.value)
                        }
                      />
                      <InputError message={erroresDireccion.ciudad} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="provincia">Provincia</Label>
                      <Input
                        id="provincia"
                        value={formDireccion.provincia}
                        onChange={(e) =>
                          setFormDireccion("provincia", e.target.value)
                        }
                      />
                      <InputError message={erroresDireccion.provincia} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="codigo_postal">Código postal</Label>
                    <Input
                      id="codigo_postal"
                      value={formDireccion.codigo_postal}
                      onChange={(e) =>
                        setFormDireccion("codigo_postal", e.target.value)
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      placeholder="Ej: 41001"
                    />
                    <InputError message={erroresDireccion.codigo_postal} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={formDireccion.predeterminada}
                      onChange={(e) =>
                        setFormDireccion("predeterminada", e.target.checked)
                      }
                    />
                    Marcar como predeterminada
                  </label>
                  <Button
                    disabled={creandoDireccion}
                    onClick={() =>
                      (direccionEditando
                        ? actualizarDireccion(`/direcciones/${direccionEditando}`, {
                            onSuccess: () => {
                              resetDireccion();
                              clearErrors();
                              setDireccionEditando(null);
                              setModalDireccionAbierto(false);
                            },
                          })
                        : guardarDireccion("/direcciones", {
                            onSuccess: () => {
                              resetDireccion();
                              clearErrors();
                              setModalDireccionAbierto(false);
                            },
                          }))
                    }
                  >
                    {direccionEditando ? "Guardar cambios" : "Guardar dirección"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {direcciones.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Aún no tienes direcciones guardadas.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {direcciones.map((direccion) => (
                <label
                  key={direccion.id}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
                    direccionSeleccionada === direccion.id
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {direccion.etiqueta} · {direccion.nombre} {direccion.apellidos}
                    </p>
                    <p className="text-xs text-slate-500">
                      {direccion.direccion}, {direccion.codigo_postal}{" "}
                      {direccion.ciudad}, {direccion.provincia}
                    </p>
                    <p className="text-xs text-slate-500">
                      Tel: {direccion.telefono}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outlineGray"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          abrirModalDireccion(direccion);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="delete"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          router.delete(`/direcciones/${direccion.id}`);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="direccion"
                    checked={direccionSeleccionada === direccion.id}
                    onChange={() => setDireccionSeleccionada(direccion.id)}
                    className="mt-1"
                  />
                </label>
              ))}
            </div>
          )}

          {!puedeCrearDireccion && (
            <p className="mt-3 text-xs text-slate-500">
              Máximo {maxDirecciones} direcciones por usuario.
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-base font-semibold text-slate-900">
            Total
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {(carrito?.subtotal || 0).toFixed(2)} €
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="default"
              disabled={productos.length === 0 || !direccionSeleccionada}
              onClick={() =>
                router.post("/carrito/checkout", {
                  direccion_id: direccionSeleccionada,
                })
              }
            >
              Pagar con Stripe
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
