import { Button } from "@/components/ui/button";
import TarjetaProducto from "@/components/TarjetaProducto";
import { Link } from "@inertiajs/react";
import Etiqueta from "@/components/etiqueta";
import AppLayout from "@/layouts/renova-layout";
import Banner from "@/components/Banner";

export default function Welcome({ modelos = [] }) {

  return (
    <AppLayout>
      <div className="w-full bg-slate-50">
        <Banner
          etiqueta="Renova"
          titulo={
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Reparamos
              <span className="block text-violet-600">Renovamos</span>
              Revolucionamos
            </h1>
          }
          descripcion="Compra, repara o renueva con Renova tecnología confiable al mejor precio."
          imagen={
            <img
              src="https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/121031-iphone-16-pro.png"
              alt="iPhone lineup"
              className="w-full max-w-xl object-contain"
            />
          }
        >
          <div className="w-full flex flex-wrap gap-3">
            <Link href="/buscar?tipo=todos">
              <Button variant="default" className="rounded-full px-6">
                Comprar Ahora
              </Button>
            </Link>
            <Link href="/reparaciones">
              <Button variant="outlineGray" className="rounded-full px-6">
                Reparaciones
              </Button>
            </Link>
          </div>
          <div className="w-full flex flex-wrap gap-3">
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
        </Banner>

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
              <Link href="/buscar?tipo=modelo">
                <Button variant="secondary" className="rounded-full px-8">
                  Ver catálogo completo
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
