import AppLayout from "@/layouts/renova-layout";
import { Button } from "@/components/ui/button";
import Banner from "@/components/Banner";
import ReparacionModal from "@/components/reparaciones/ReparacionModal";
import {Collapsible,CollapsibleContent,CollapsibleTrigger} from "@/components/ui/collapsible";
import {BatteryCharging,Camera,Headphones,Droplets,Wifi,Cpu,Smartphone,Wrench} from "lucide-react";

// Reparaciones
const servicios = [
  { id: 1, titulo: "Pantalla", descripcion: "Sustitución de pantalla táctil y LCD.", icono: Smartphone },
  { id: 2, titulo: "Batería", descripcion: "Sustitución con batería totalmente nueva.", icono: BatteryCharging },
  { id: 3, titulo: "Cámara", descripcion: "Cámara frontal y trasera.", icono: Camera },
  { id: 4, titulo: "Audio", descripcion: "Altavoz, micrófono y auricular.", icono: Headphones },
  { id: 5, titulo: "Conectividad", descripcion: "WiFi, Bluetooth, GPS y red móvil.", icono: Wifi },
  { id: 6, titulo: "Daño por agua", descripcion: "Limpieza y recuperación de componentes.", icono: Droplets },
  { id: 7, titulo: "Placa base", descripcion: "Microsoldadura y reparaciones avanzadas.", icono: Cpu },
  { id: 8, titulo: "Otras reparaciones", descripcion: "Botones, sensores y conectores.", icono: Wrench },
];

const preguntas = [
  {
    pregunta: "¿Cuánto tarda una reparación?",
    respuesta:
      "Depende del tipo de reparación. Nos comprometemos a mantenerte informado de todo el proceso, Los margenes de tiempo suelen estar de 3 dias desde que recibimos el producto.",
  },
  {
    pregunta: "¿Qué garantía ofrecéis?",
    respuesta:
      "Todas las reparaciones incluyen 6 meses de garantía.",
  },
  {
    pregunta: "¿Cómo funciona al ser online?",
    respuesta:
      "Contactas con nosotros solicitando el tipo de reparación y coordinamos la recogida o envio del dispositivo.",
  },
  {
    pregunta: "¿Usáis piezas originales?",
    respuesta:
      "Trabajamos con repuestos 100% originales y compatibles de alta calidad dandote una opción mas económica .",
  },
];

export default function Reparaciones({ direcciones = [] }) {
  return (
    <AppLayout>
      <div className="w-full bg-slate-50">
        <Banner
          etiqueta="Reparaciones Renova"
          titulo={
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Repara hoy,
              <span className="block text-violet-600">recupera tu móvil</span>
              sin esperas
            </h1>
          }
          descripcion="Diagnóstico rápido, repuestos de calidad y garantía clara. Elige el tipo de reparación y te damos precio al instante."
          imagen={
            <img
              src="https://reparacionemovil.com/img/cms/mobil%20repara.jpg"
              alt="Reparación de smartphone"
              className="w-full max-w-xl rounded-2xl object-contain"
            />
          }
        >
          <ReparacionModal direcciones={direcciones} />
          <a href="#servicios">
            <Button variant="outlineGray">Consultar servicios</Button>
          </a>
        </Banner>

        <section id="servicios" className="mt-16 bg-slate-100">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Nuestros <span className="text-violet-600">Servicios</span>
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Elige el tipo de reparación y te damos un presupuesto rápido.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {servicios.map((servicio) => {
                const Icono = servicio.icono;
                return (
                  <div
                    key={servicio.id}
                    className="mx-auto flex w-full max-w-xs flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                      <Icono className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-slate-900">
                      {servicio.titulo}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500">
                      {servicio.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Preguntas{" "}
                <span className="bg-linear-to-r from-[#9747FF] to-[#FF2E88] bg-clip-text text-transparent">
                  frecuentes
                </span>
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Todo el servicio es 100% online. Aquí resolvemos las dudas más comunes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 pb-12">
              {preguntas.map((item) => (
                <Collapsible
                  key={item.pregunta}
                >
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-5">
                    <CollapsibleTrigger className="absolute inset-0 cursor-pointer rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-200">
                      <span className="sr-only">Abrir o cerrar pregunta</span>
                    </CollapsibleTrigger>
                    <div className="flex items-center justify-between text-left text-sm font-semibold text-slate-900">
                      <span>{item.pregunta}</span>
                      <span className="ml-4 text-slate-400">+</span>
                    </div>
                    <CollapsibleContent>
                      <p className="mt-3 text-sm text-slate-500">
                        {item.respuesta}
                      </p>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
