import { useState } from "react";
import AppLayout from "@/layouts/renova-layout";
import { Button } from "@/components/ui/button";
import BarraLateral from "@/components/barra-lateral";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleAlert, Sparkles, Medal, Star, ShieldCheck } from "lucide-react";

const colores = {
  Negro: "bg-black",
  Blanco: "bg-white",
  Azul: "bg-blue-500",
  Gris: "bg-slate-400",
  Rojo: "bg-red-500",
  Dorado: "bg-amber-400",
  Verde: "bg-emerald-500",
  Morado: "bg-purple-500",
  Plateado: "bg-slate-300",
  Rosa: "bg-pink-400",
};

const Etiquetas = {
  verde: "bg-emerald-500",
  azul: "bg-blue-500",
  dorado: "bg-amber-500",
  rosa: "bg-pink-500",
};

const gradosInfo = [
  {
    titulo: "Como nuevo - S+",
    descripcion: "Estado impecable, sin marcas visibles de uso.",
    icono: Sparkles,
    colorIcono: "from-fuchsia-500 to-violet-500",
    puntos: ["Sin arañazos en pantalla o carcasa", "Batería con salud del 100%", "Funcionalidad perfecta al 100%"],
  },
  {
    titulo: "Excelente - A+",
    descripcion: "Estado excelente con mínimas señales de uso.",
    icono: Medal,
    colorIcono: "from-blue-500 to-cyan-500",
    puntos: ["Arañazos mínimos imperceptibles", "Batería con salud superior al 90%", "Funcionalidad perfecta al 100%"],
  },
  {
    titulo: "Muy bueno - A",
    descripcion: "Muy buen estado, leves marcas de uso.",
    icono: Star,
    colorIcono: "from-emerald-500 to-teal-500",
    puntos: ["Arañazos ligeros en carcasa", "Batería con salud superior al 85%", "Funcionalidad al 100%"],
  },
  {
    titulo: "Bueno - B",
    descripcion: "Funcional y revisado, con señales evidentes de uso.",
    icono: ShieldCheck,
    colorIcono: "from-orange-500 to-amber-500",
    puntos: ["Arañazos y marcas visibles", "Batería con salud superior al 80%", "Funcionalidad al 100%"],
  },
];

export default function Producto({
  tipo = "modelo",
  modelo,
  componente,
  coloresDisponibles = [],
  gradosDisponibles = [],
  almacenamientosDisponibles = [],
  stockPorVariante = {},
}) {
  if (tipo === "componente") {
    const nombre = componente.nombre;
    const subtitulo = componente.subtitulo;
    const precio = Math.round(componente.precio);
    const imagenesComponente = componente.fotos || [];
    const imagen = imagenesComponente[0] || null;
    const stockDisponible = componente.stock_disponible;

    return (
      <AppLayout>
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="h-[420px] w-full">
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={nombre}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                      Sin foto
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">{nombre}</h1>
                <p className="text-base text-slate-500">{subtitulo}</p>
              </div>

              <BarraLateral titulo="">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-semibold text-violet-600">{precio}€</span>
                  <span className="text-sm text-slate-400">IVA incluido</span>
                </div>
              </BarraLateral>

              <BarraLateral titulo="">
                <p className="text-sm text-slate-600">{componente.descripcion || 'Sin descripción'}</p>
              </BarraLateral>

              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  Stock disponible: <span className="font-semibold">{stockDisponible}</span>
                </p>
                <Button
                  variant="default"
                  className="h-12 w-full rounded-full text-base"
                  disabled={stockDisponible <= 0}
                  onClick={() =>
                    router.post("/carrito/productos", {
                      tipo: "componente",
                      id: componente.id,
                      cantidad: 1,
                    })
                  }
                >
                  Añadir al carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const [colorActivo, setColorActivo] = useState(coloresDisponibles[0] || "");
  const [gradoActivo, setGradoActivo] = useState(gradosDisponibles[0] || "");
  const [capacidadActiva, setCapacidadActiva] = useState(almacenamientosDisponibles[0] || "");
  const [cantidad, setCantidad] = useState(1);
  const [modalGradosAbierto, setModalGradosAbierto] = useState(false);
  const imagenesModelo = modelo.fotos || [];
  const [imagenModeloActiva, setImagenModeloActiva] = useState(imagenesModelo[0] || null);


  const claveVariante = `${colorActivo}|${gradoActivo}|${capacidadActiva}`;
  const stockDisponible = stockPorVariante[claveVariante] ?? 0;
  const hayVariantesConStock = Object.values(stockPorVariante).some((stock) => stock > 0);

  const descuentosGrado = {
    S: 0.05,
    "A+": 0.15,
    A: 0.25,
    B: 0.35,
  };
  const descuentosCapacidad = {
    128: 0.15,
    256: 0.1,
    512: 0.05,
    1024: 0.0,
  };

  const descuentoGrado = descuentosGrado[gradoActivo] || 0;
  const descuentoCapacidad = descuentosCapacidad[capacidadActiva] || 0;
  const precioCalculado = Math.round(
    (modelo.precio_base) * (1 - descuentoGrado) * (1 - descuentoCapacidad)
  );


  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="h-[420px] w-full">
                  {imagenesModelo[0] ? (
                    <img
                      src={imagenModeloActiva || imagenesModelo[0]}
                      alt={`${modelo.marca} ${modelo.nombre}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                      Sin foto
                    </div>
                  )}
                </div>
              </div>

            {imagenesModelo.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {imagenesModelo.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setImagenModeloActiva(src)}
                    className={`overflow-hidden rounded-2xl border ${
                      (imagenModeloActiva || imagenesModelo[0]) === src ? "border-violet-500" : "border-slate-200"
                    } bg-white shadow-sm`}
                  >
                    <img src={src} alt="" className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {modelo.marca} {modelo.nombre}
              </h1>
              {modelo.eslogan ? (
                <p className="text-base text-slate-500">{modelo.eslogan}</p>
              ) : null}
            </div>

            <BarraLateral titulo="">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-semibold text-violet-600">
                  {precioCalculado}€
                </span>
                <span className="text-base text-slate-400 line-through">
                  {Math.round(modelo.precio_base)}€
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-400">
                IVA incluido
              </div>
            </BarraLateral>

            <BarraLateral titulo="">
              {modelo.descripcion || 'Sin descripción'}
            </BarraLateral>

            <BarraLateral titulo="">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-900">
                  Estado: <span className="text-violet-600">Excelente</span>
                </span>
                <button
                  type="button"
                  onClick={() => setModalGradosAbierto(true)}
                  className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                >
                  <CircleAlert className="h-4 w-4" />
                  ¿Qué significa?
                </button>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {[
                  { title: "S", tag: "Premium", desc: "-5%", color: "verde" },
                  { title: "A+", tag: "Más popular", desc: "-15%", color: "azul" },
                  { title: "A", tag: "Mejor precio", desc: "-25%", color: "dorado" },
                  { title: "B", tag: "Max.Ahorro", desc: "-35%", color: "rosa" },
                ]
                  .filter((item) => gradosDisponibles.includes(item.title))
                  .map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setGradoActivo(item.title)}
                    className={`relative rounded-2xl border p-4 text-sm transition-transform duration-200 hover:scale-[1.02] ${
                      gradoActivo === item.title ? "border-violet-500 bg-violet-50 scale-[1.02]" : "border-slate-200"
                    } cursor-pointer`}
                  >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold text-white ${
                          Etiquetas[item.color] || "bg-slate-500"
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </BarraLateral>

            <BarraLateral titulo="">
              <div className="text-sm font-semibold text-slate-900">
                Color: <span className="text-violet-600">{colorActivo}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {coloresDisponibles.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorActivo(color)}
                    className={`h-10 w-10 rounded-full border transition-transform duration-200 hover:scale-110 ${
                      colorActivo === color ? "border-violet-500 ring-2 ring-violet-200 scale-110" : "border-slate-200"
                    } ${colores[color] || "bg-slate-200"} cursor-pointer`}
                    title={color}
                  />
                ))}
              </div>
            </BarraLateral>

            <BarraLateral titulo="">
              <div className="text-sm font-semibold text-slate-500">Capacidad de almacenamiento</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {almacenamientosDisponibles.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setCapacidadActiva(cap)}
                    className={`rounded-2xl border p-3 text-center text-sm transition-transform duration-200 hover:scale-[1.02] ${
                      capacidadActiva === cap ? "border-violet-500 bg-violet-50 scale-[1.02]" : "border-slate-200"
                    } cursor-pointer`}
                  >
                    <div className="text-base font-semibold text-slate-900">{cap} GB</div>
                  </button>
                ))}
              </div>
            </BarraLateral>

            <BarraLateral titulo="">
              <div className="text-sm font-semibold text-slate-500">Cantidad</div>
              <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setCantidad((valor) => Math.max(1, valor - 1))}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500"
                >
                  -
                </button>
                <span className="text-base font-semibold text-slate-900">{cantidad}</span>
                <button
                  type="button"
                  onClick={() => setCantidad((valor) => valor + 1)}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500"
                >
                  +
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Stock disponible: {stockDisponible}
              </div>
              {!hayVariantesConStock ? (
                <div className="mt-2 text-xs font-semibold text-red-500">
                  Sin stock en este modelo.
                </div>
              ) : null}
            </BarraLateral>

            <Button
              variant="default"
              className="h-12 w-full rounded-full text-base"
              disabled={
                !hayVariantesConStock
                || !colorActivo
                || !gradoActivo
                || !capacidadActiva
                || stockDisponible <= 0
              }
              onClick={() =>
                router.post("/carrito/productos", {
                  tipo: "movil",
                  id: modelo.id,
                  cantidad,
                  variante: {
                    color: colorActivo,
                    grado: gradoActivo,
                    almacenamiento: capacidadActiva,
                  },
                })
              }
            >
              Añadir al carrito
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={modalGradosAbierto} onOpenChange={setModalGradosAbierto}>
        <DialogContent className="w-[95vw] max-w-6xl rounded-2xl border-slate-200 p-6 sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-4xl">Grados de móviles renovados</DialogTitle>
            <DialogDescription>
              Conoce el estado estético de cada dispositivo reacondicionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {gradosInfo.map((grado) => {
              const Icono = grado.icono;
              return (
                <div key={grado.titulo} className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`rounded-xl bg-gradient-to-r ${grado.colorIcono} p-3 text-white`}>
                      <Icono className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{grado.titulo}</h4>
                      <p className="text-sm text-slate-600">{grado.descripcion}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {grado.puntos.map((punto) => (
                      <li key={punto}>- {punto}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
            Garantia incluida: 12 meses de garantia y 14 dias de devolucion.
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
