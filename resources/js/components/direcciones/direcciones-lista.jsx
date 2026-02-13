import { Button } from "@/components/ui/button";

export default function DireccionesLista({
  direcciones = [],
  seleccionable = false,
  direccionSeleccionada = null,
  onSeleccionar,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="mt-4 grid gap-3">
      {direcciones.map((direccion) => {
        const contenido = (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {direccion.etiqueta} · {direccion.nombre} {direccion.apellidos}
                </p>
                {direccion.predeterminada ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    Predeterminada
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                {direccion.direccion}, {direccion.codigo_postal} {direccion.ciudad}, {direccion.provincia}
              </p>
              <p className="text-xs text-slate-500">DNI: {direccion.dni || '-'}</p>
              <p className="text-xs text-slate-500">Tel: {direccion.telefono}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outlineGray"
                  size="sm"
                  onClick={(event) => {
                    if (seleccionable) {
                      event.preventDefault();
                    }
                    onEditar?.(direccion);
                  }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="delete"
                  size="sm"
                  onClick={(event) => {
                    if (seleccionable) {
                      event.preventDefault();
                    }
                    onEliminar?.(direccion);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            {seleccionable ? (
              <input
                type="radio"
                name="direccion"
                checked={direccionSeleccionada === direccion.id}
                onChange={() => onSeleccionar?.(direccion.id)}
                className="mt-1"
              />
            ) : null}
          </>
        );

        if (seleccionable) {
          return (
            <label
              key={direccion.id}
              className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
                direccionSeleccionada === direccion.id
                  ? "border-violet-300 bg-violet-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {contenido}
            </label>
          );
        }

        return (
          <div
            key={direccion.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            {contenido}
          </div>
        );
      })}
    </div>
  );
}
