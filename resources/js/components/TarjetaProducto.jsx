import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const colores = {
  Negro: "bg-black",
  Marron: "bg-amber-800",
  Blanco: "bg-white border border-[#e5e7eb]",
  Rojo: "bg-red-500",
  Dorado: "bg-amber-400",
  Azul: "bg-blue-500",
  Amarillo: "bg-yellow-400",
  Morado: "bg-purple-500",
  Gris: "bg-neutral-500",
  Plateado: "bg-slate-300",
  Naranja: "bg-orange-500",
  Verde: "bg-emerald-500",
};

export default function TarjetaProducto({
  tipo = "modelo",
  nombre,
  precio,
  imagen,
  coloresDisponibles,
  categoria,
  modeloCompatible,
}) {
  const precioRedondeado = Math.round(precio ?? 0);

  return (
    <Card className="group relative w-full max-w-sm overflow-hidden border border-black/5 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
      <CardHeader className="relative p-0">
        <div className="relative">
          <div className="aspect-4/3 w-full overflow-hidden">
            {imagen ? (
              <img
                src={imagen}
                alt={nombre}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                Sin foto
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 via-black/10 to-black/45" />

            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              {tipo === "modelo" ? "Renovado" : "Nuevo"}
            </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 pt-5 pb-0">
        <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-900">
          {nombre}
        </CardTitle>

        {/* Coloca las etiquetas si es un componente */}
        <div className="flex items-center justify-between">
            {tipo === "componente" ? (
              <div className="flex flex-wrap items-center gap-2">
              {categoria && (
                <span className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-slate-700">
                  {categoria}
                </span>
              )}

              {modeloCompatible && (
                <span
                  className="inline-flex max-w-full items-center truncate rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-slate-900"
                  title={modeloCompatible}
                >
                  {modeloCompatible}
                </span>
              )}
            </div>
            ) : (
            <>
              {/* Coloca los colores y la garantia si no lo es */}
              <div className="flex items-center gap-1.5">
                {coloresDisponibles.map((colorDisponible) => (
                  <span
                    key={colorDisponible}
                    className={`h-4 w-4 rounded-full ring-2 ring-white shadow-sm ${
                      colores[colorDisponible] || "bg-neutral-300"
                    }`}
                    title={colorDisponible}
                  />
                ))}
              </div>

              {tipo !== "componente" && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                  Garantía 12m
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          {tipo !== "componente" && (
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Desde
            </span>
          )}
          <span className="text-2xl font-bold text-slate-900">{precioRedondeado}€</span>
          <span className="text-xs text-muted-foreground">IVA incl.</span>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-6 pt-4">
        <Button variant="default" size="sm" className="h-11 w-full rounded-full">
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
