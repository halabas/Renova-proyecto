import AppLayout from "@/layouts/renova-layout";
import TarjetaProducto from "@/components/TarjetaProducto";
import FiltroRadio from "@/components/filtro-radio";
import FiltroSelect from "@/components/filtro-select";
import BarraLateral from "@/components/barra-lateral";
import { Link, router } from "@inertiajs/react";
import { useState } from "react";

const imagenprueba =
  "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MP_142470444?x=536&y=402&format=jpg&quality=80&sp=yes&strip=yes&trim&ex=536&ey=402&align=center&resizesource&unsharp=1.5x1+0.7+0.02&cox=0&coy=0&cdx=536&cdy=402";

export default function Busqueda({
  busqueda = "",
  resultados = [],
  // Filtros activos.

  tipo = "todos",
  marca = null,
  categoria = null,
  color = null,
  modelo = null,
  max = null,
  orden = "nombre_asc",

  // Total de opciones para filtros
  marcas = [],
  categorias = [],
  colores = [],
  modelosCompatibles = [],
}) {
  const items = resultados.data || [];
  const total = resultados.total || 0;
  const links = resultados.links || [];
  const ValorMaximo = max ?? 1500;
  const [precioMax, setPrecioMax] = useState(ValorMaximo);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Resultados</h1>
          <p className="text-sm text-slate-500">
            { `Resultados para "${busqueda}"`} ·{" "}
            {total} encontrados
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full max-w-xs space-y-4">
            <BarraLateral titulo="Filtros" />
            <BarraLateral titulo="Tipo">
              <FiltroRadio
                nombre="tipo"
                valor={tipo}
                opciones={[
                  { value: "todos", label: "Todos" },
                  { value: "modelo", label: "Modelos" },
                  { value: "componente", label: "Componentes" },
                ]}
                onChange={(value) =>
                  router.get(
                    "/buscar",
                    { busqueda, tipo: value, page: 1, marca: null, categoria: null, color: null, modelo: null },
                    { preserveScroll: true, preserveState: true, replace: true }
                  )
                }
              />
            </BarraLateral>

            {tipo === "modelo" && (
              <BarraLateral titulo="Marca">
                <FiltroRadio
                  nombre="marca"
                  valor={marca}
                  opciones={[
                    { value: null, label: "Todas" },
                    ...marcas.map((item) => ({ value: item, label: item })),
                  ]}
                  onChange={(value) =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, marca: value, color, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                />
              </BarraLateral>
            )}

            {tipo === "componente" && (
              <BarraLateral titulo="Categoría">
                <FiltroRadio
                  nombre="categoria"
                  valor={categoria}
                  opciones={[
                    { value: null, label: "Todas" },
                    ...categorias.map((item) => ({ value: item, label: item })),
                  ]}
                  onChange={(value) =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, categoria: value, modelo, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                />
              </BarraLateral>
            )}

            {tipo === "modelo" && colores.length > 0 && (
              <BarraLateral titulo="Color">
                <FiltroRadio
                  nombre="color"
                  valor={color}
                  opciones={[
                    { value: null, label: "Todos" },
                    ...colores.map((item) => ({ value: item, label: item })),
                  ]}
                  onChange={(value) =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, marca, color: value, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                />
              </BarraLateral>
            )}

            {tipo === "componente" && modelosCompatibles.length > 0 && (
              <BarraLateral titulo="Modelo compatible">
                <FiltroSelect
                  valor={modelo || ""}
                  opciones={[
                    { value: "", label: "Todos" },
                    ...modelosCompatibles.map((item) => ({ value: item.id, label: item.nombre })),
                  ]}
                  onChange={(value) =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, categoria, modelo: value || null, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                />
              </BarraLateral>
            )}

            <BarraLateral titulo="Rango de precio">
              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max="1500"
                  value={precioMax}
                  onChange={(event) => setPrecioMax(event.target.value)}
                  onMouseUp={() =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, marca, categoria, color, modelo, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                  onTouchEnd={() =>
                    router.get(
                      "/buscar",
                      { busqueda, tipo, marca, categoria, color, modelo, max: precioMax, orden, page: 1 },
                      { preserveScroll: true, preserveState: true, replace: true }
                    )
                  }
                  className="w-full accent-[#9747FF]"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>0€</span>
                  <span>{precioMax}€</span>
                </div>
              </div>
            </BarraLateral>
          </aside>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-end">
              <FiltroSelect
                valor={orden}
                opciones={[
                  { value: "nombre_asc", label: "Nombre A-Z" },
                  { value: "nombre_desc", label: "Nombre Z-A" },
                  { value: "precio_asc", label: "Precio menor a mayor" },
                  { value: "precio_desc", label: "Precio mayor a menor" },
                ]}
                onChange={(value) =>
                  router.get(
                    "/buscar",
                    {
                      busqueda,
                      tipo,
                      marca,
                      categoria,
                      color,
                      modelo,
                      max: precioMax,
                      orden: value,
                      page: 1,
                    },
                    { preserveScroll: true, preserveState: true, replace: true }
                  )
                }
              />
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
                  Sin resultados
                </div>
              )}

              {items.map((item) => (
                <Link
                  key={`${item.tipo}-${item.id}`}
                  href={item.tipo === "modelo" ? `/modelos/${item.id}` : `/componentes/${item.id}`}
                  className="w-full"
                >
                  <TarjetaProducto
                    tipo={item.tipo}
                    nombre={item.nombre}
                    precio={item.precio ?? 0}
                    imagen={item.imagen || imagenprueba}
                    coloresDisponibles={item.coloresDisponibles || []}
                    categoria={item.categoria}
                    modeloCompatible={item.modeloCompatible}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {links.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {links.map((link, index) => (
                // Paginacion
              <Link
                key={`${link.label}-${index}`}
                href={link.url || "#"}
                className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                  link.active
                    ? "border-slate-400 bg-slate-100 text-slate-900"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                } ${link.url ? "" : "pointer-events-none opacity-50"}`}
                preserveScroll
              >
                  {link.label === "pagination.previous"
                    ? "Anterior"
                  : link.label === "pagination.next"
                    ? "Siguiente"
                    : link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
