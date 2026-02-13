import AppLayout from "@/layouts/renova-layout";

export default function TerminosCondiciones() {
  return (
    <AppLayout>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50 p-8 shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">Legal</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Terminos y Condiciones</h1>
            <p className="mt-6 max-w-4xl text-base leading-7 text-slate-600">
              Estas condiciones regulan el uso de Renova y la contratacion de productos, reparaciones y servicios
              relacionados. Al utilizar la web aceptas estos terminos.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">1. Compras y pagos</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                El pedido se considera confirmado tras la validacion del pago. Si existe una incidencia de stock, se
                te informara con la mayor rapidez posible para acordar sustitucion, espera o devolucion.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">2. Envio y entrega</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Los plazos son orientativos y pueden variar por causas logisticas. Es responsabilidad del cliente
                facilitar datos correctos de entrega para evitar retrasos.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">3. Reparaciones</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                El flujo de reparacion puede incluir revision inicial y presupuesto. La reparacion solo se ejecuta tras
                la aceptacion expresa del presupuesto por parte del cliente.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">4. Garantia y devoluciones</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Los productos renovados incluyen garantia y devolucion conforme a la normativa aplicable. Las
                devoluciones podran ser rechazadas si el producto presenta uso indebido o manipulacion no autorizada.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">5. Limitacion de responsabilidad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Renova no sera responsable de danos indirectos o de terceros derivados del uso del producto fuera de
                las condiciones normales o recomendadas por el fabricante.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">6. Contacto</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Para cualquier duda legal o comercial puedes escribirnos a
                {" "}
                <a className="font-medium text-violet-600 hover:underline" href="mailto:Renova@support.com">
                  Renova@support.com
                </a>.
              </p>
            </article>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
