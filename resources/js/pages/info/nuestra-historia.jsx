import AppLayout from "@/layouts/renova-layout";

export default function NuestraHistoria() {
  return (
    <AppLayout>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50 p-8 shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">Renova</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Nuestra Historia</h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-600">
              Renova nace con un objetivo muy claro: hacer que la tecnologia de calidad sea mas accesible, mas
              sostenible y mas confiable. Empezamos reparando moviles en un taller local y hoy combinamos venta de
              dispositivos renovados, reparaciones especializadas y soporte continuo para nuestros clientes.
            </p>
            <p className="mt-4 max-w-3xl text-base text-slate-600">
              Creemos que cada dispositivo puede tener una segunda vida si se revisa bien y se entrega con
              transparencia. Por eso cada movil pasa controles de estado, bateria, conectividad y rendimiento, y cada
              reparacion se gestiona con seguimiento claro de principio a fin.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Mision</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ofrecer moviles renovados y reparaciones profesionales con precios justos, garantia real y atencion
                humana en cada paso.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Vision</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ser una referencia nacional en tecnologia reacondicionada, reduciendo residuos electronicos sin perder
                calidad ni confianza.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Valores</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Transparencia, mejora continua, responsabilidad y compromiso con el cliente antes, durante y despues de
                cada compra.
              </p>
            </article>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Como trabajamos</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-slate-900">1. Seleccion y revision</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Revisamos equipos por estado fisico, capacidad, autonomia de bateria y funcionamiento general para
                  asegurar un producto fiable desde el primer uso.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">2. Preparacion y garantia</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cada dispositivo se limpia, se prueba y se entrega con garantia y factura para que compres con
                  seguridad.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">3. Soporte y reparacion</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Si surge cualquier incidencia, nuestro equipo tecnico te acompana con seguimiento real y soluciones
                  claras.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">4. Economia circular</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Apostamos por alargar la vida util de cada movil para reducir residuos y consumo innecesario de
                  recursos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
