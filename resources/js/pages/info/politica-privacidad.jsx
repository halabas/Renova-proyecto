import AppLayout from "@/layouts/renova-layout";

export default function PoliticaPrivacidad() {
  return (
    <AppLayout>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50 p-8 shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">Legal</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Politica de Privacidad</h1>
            <p className="mt-6 max-w-4xl text-base leading-7 text-slate-600">
              En Renova protegemos tus datos personales y los tratamos con responsabilidad. Esta politica explica que
              informacion recopilamos, para que la usamos, durante cuanto tiempo la conservamos y que derechos tienes
              sobre ella.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">1. Datos que recopilamos</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Nombre, email, telefono, direcciones de envio y datos necesarios para compras, reparaciones y soporte.
                Tambien recopilamos informacion tecnica basica para mejorar la experiencia de uso.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">2. Finalidad del tratamiento</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Gestionar pedidos, tramitar pagos, emitir facturas, atender solicitudes de reparacion y resolver
                incidencias de soporte.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">3. Base legal</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Tratamos tus datos para ejecutar la relacion contractual, cumplir obligaciones legales y, cuando
                corresponda, sobre la base de tu consentimiento.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">4. Conservacion</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Conservamos la informacion durante el tiempo necesario para prestar el servicio y cumplir obligaciones
                fiscales y administrativas.
              </p>
            </article>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Tus derechos</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Puedes ejercer tus derechos de acceso, rectificacion, supresion, oposicion, limitacion y portabilidad.
              Para ello escribe a
              {" "}
              <a className="font-medium text-violet-600 hover:underline" href="mailto:Renova@support.com">
                Renova@support.com
              </a>
              {" "}
              indicando tu solicitud y un metodo de contacto.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Si detectas un uso indebido de tus datos, tambien puedes presentar una reclamacion ante la autoridad de
              control competente.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
