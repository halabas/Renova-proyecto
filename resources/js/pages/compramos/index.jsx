import { Head } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AppLayout from "@/layouts/renova-layout";
import { Button } from "@/components/ui/button";

const FACTOR_ESTADO = {
  impecable: 1,
  bueno: 0.85,
  usado: 0.65,
  desgastado: 0.45,
};

export default function CompramosIndex({ marcas = [], modelos = [] }) {
  const [marcaId, setMarcaId] = useState("");
  const [modeloId, setModeloId] = useState("");
  const [estado, setEstado] = useState("bueno");
  const [antiguedad, setAntiguedad] = useState(2);

  const modelosFiltrados = useMemo(() => {
    if (!marcaId) {
      return [];
    }
    return modelos.filter((modelo) => String(modelo.marca_id) === String(marcaId));
  }, [marcaId, modelos]);

  const modeloSeleccionado = useMemo(
    () => modelos.find((modelo) => String(modelo.id) === String(modeloId)),
    [modeloId, modelos]
  );

  const precioEstimado = useMemo(() => {
    if (!modeloSeleccionado) {
      return null;
    }

    const baseCompra = modeloSeleccionado.precio_base * 0.55;
    const factorEstado = FACTOR_ESTADO[estado] ?? 0.65;
    const factorAntiguedad = Math.max(0.35, 1 - Number(antiguedad) * 0.1);
    const estimado = baseCompra * factorEstado * factorAntiguedad;
    return Math.max(25, Math.round(estimado));
  }, [modeloSeleccionado, estado, antiguedad]);

  const reiniciar = () => {
    setMarcaId("");
    setModeloId("");
    setEstado("bueno");
    setAntiguedad(2);
  };

  return (
    <AppLayout>
      <Head title="Compramos tu móvil" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Renova</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Calcula cuánto te damos por tu móvil</h1>
          <p className="mt-2 text-sm text-slate-500">
            Simulación orientativa según marca, modelo, estado y antigüedad.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Marca</span>
              <select
                value={marcaId}
                onChange={(event) => {
                  setMarcaId(event.target.value);
                  setModeloId("");
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="">Selecciona una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Modelo</span>
              <select
                value={modeloId}
                onChange={(event) => setModeloId(event.target.value)}
                disabled={!marcaId}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Selecciona un modelo</option>
                {modelosFiltrados.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Estado</span>
              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="impecable">Impecable</option>
                <option value="bueno">Bueno</option>
                <option value="usado">Usado</option>
                <option value="desgastado">Desgastado</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Antigüedad aproximada: {antiguedad} años
              </span>
              <input
                type="range"
                min="0"
                max="8"
                value={antiguedad}
                onChange={(event) => setAntiguedad(Number(event.target.value))}
                className="w-full accent-violet-600"
              />
            </label>
          </div>

          <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm text-slate-600">Oferta estimada</p>
            <p className="mt-1 text-4xl font-semibold text-slate-900">
              {precioEstimado !== null ? `${precioEstimado} €` : "--"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Precio orientativo. La oferta final puede variar tras revisión física del dispositivo.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="button" onClick={reiniciar} variant="outlineGray">
              Limpiar
            </Button>
            <Button type="button" variant="default" disabled={precioEstimado === null}>
              Solicitar valoración
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
