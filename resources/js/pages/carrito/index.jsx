import { router } from "@inertiajs/react";
import AppLayout from "@/layouts/renova-layout";
import { Button } from "@/components/ui/button";

export default function Carrito({ carrito }) {
  const productos = carrito.productos

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
              disabled={productos.length === 0}
              onClick={() => router.post("/carrito/checkout")}
            >
              Pagar con Stripe
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
