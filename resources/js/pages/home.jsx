import { Button } from "@/components/ui/button";
import TarjetaProducto from "@/components/TarjetaProducto";
import { Link } from "@inertiajs/react";
import Etiqueta from "@/components/etiqueta";
import AppLayout from "@/layouts/renova-layout";

export default function Welcome({ modelos = [] }) {

  return (
    <AppLayout>
      <div className="w-full bg-slate-50">
        <section className="mx-auto w-full max-w-7xl px-6 pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white px-6 py-10 shadow-lg sm:px-10">
            <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-violet-100" />
            <div className="pointer-events-none absolute -right-12 top-16 h-32 w-32 rounded-full bg-pink-100" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-full bg-linear-to-r from-white to-transparent" />
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Renova
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Reparamos
                <span className="block text-violet-600">Renovamos</span>
                Revolucionamos
              </h1>
              <p className="mt-4 max-w-md text-sm text-slate-500">
                Compra, repara o renueva con Renova tecnología confiable al mejor precio.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="default" className="rounded-full px-6">
                  Comprar Ahora
                </Button>
                <Button variant="outlineGray" className="rounded-full px-6">
                  Reparaciones
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { title: "5G", label: "Ultra rápido" },
                  { title: "108 MP", label: "Cámara" },
                  { title: "+24H", label: "Batería" },
                ].map((feature) => (
                  <Etiqueta
                    key={feature.title}
                    title={feature.title}
                    label={feature.label}
                  />
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/121031-iphone-16-pro.png"
                alt="iPhone lineup"
                className="w-full max-w-xl object-contain"
              />
            </div>
          </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Selección de{" "}
                <span className="text-violet-600">Modelos</span>
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Encuentra el modelo perfecto con garantías y calidad Renova.
              </p>
            </div>

            <div className="mt-10 grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modelos.map((producto) => (
                <Link key={producto.id} href={`/modelos/${producto.id}`} className="w-full">
                  <TarjetaProducto
                    tipo="modelo"
                    nombre={producto.nombre}
                    precio={producto.precio}
                    imagen={
                      producto.imagen ||
                      "https://i.blogs.es/3339e4/img_1199/1366_2000.jpg"
                    }
                    coloresDisponibles={producto.coloresDisponibles || []}
                  />
                </Link>
              ))}
            </div>

            <div className="mt-10 flex justify-center pb-16">
              <Button variant="secondary" className="rounded-full px-8">
                Ver catálogo completo
              </Button>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
