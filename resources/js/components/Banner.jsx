export default function Banner({
  etiqueta,
  titulo,
  descripcion,
  imagen,
  children,
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white px-6 py-10 shadow-lg sm:px-10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-violet-100" />
        <div className="pointer-events-none absolute -right-12 top-16 h-32 w-32 rounded-full bg-pink-100" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-full bg-linear-to-r from-white to-transparent" />
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            {etiqueta && (
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {etiqueta}
              </span>
            )}
            {titulo}
            {descripcion && (
              <p className="mt-4 max-w-md text-sm text-slate-500">
                {descripcion}
              </p>
            )}
            {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
          </div>
          <div className="relative">{imagen}</div>
        </div>
      </div>
    </section>
  );
}
