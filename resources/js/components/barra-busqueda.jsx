import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";

export default function BarraBusqueda() {
  const [consulta, setConsulta] = useState("");
  const [abrir, setAbrir] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [carga, setCarga] = useState(false);
  const contenedorRef = useRef(null);

  const consultaClean = consulta.trim();


  useEffect(() => {
    // Comprobamos si la consulta esta vacia.
    if (!consultaClean) {
      setResultados([]);
      return;
    }

    // Si no esta vacia hacemos la peticion , con abort controller para cancelar peticiones anteriores y que no devuelva resultados incorrectos.
    const controller = new AbortController();
    const load = async () => {
      setCarga(true);
      try {
        const response = await fetch(`/buscar?busqueda=${encodeURIComponent(consultaClean)}&limit=8`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const data = await response.json();
        setResultados(Array.isArray(data.resultados) ? data.resultados : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResultados([]);
        }
      } finally {
        setCarga(false);
      }
    };

    // Creamos un pequeño timeout para que no cargue con cada tecla y no saturar con peticiones.
    const espera = setTimeout(load, 250);
    return () => {
      controller.abort();
      clearTimeout(espera);
    };
  }, [consultaClean]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target)) {
        setAbrir(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Maneja el envio de la busqueda.
  function handleSubmit() {
    if (!consultaClean) return;
    router.get("/buscar", { busqueda: consultaClean });
    setAbrir(false);
  }

  return (
    <div ref={contenedorRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={consulta}
          onChange={(event) => {
            setConsulta(event.target.value);
            setAbrir(true);
          }}
          onFocus={() => setAbrir(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Buscar producto..."
          className="h-11 w-full rounded-full border border-gray-200 bg-white px-9 text-base text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none"
        />
        {consulta && (
          <button
            type="button"
            onClick={() => {
              setConsulta("");
              setAbrir(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {abrir && consultaClean.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
            <span>
              Resultados para "{consultaClean}"
            </span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setAbrir(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-auto">
            {carga && (
              <div className="px-4 py-6 text-sm text-gray-500">
                Buscando...
              </div>
            )}

            {!carga && resultados.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500">
                Sin resultados
              </div>
            )}

            {!carga &&
              resultados.map((producto) => (
                <button
                  key={`${producto.tipo}-${producto.id}`}
                  type="button"
                  onClick={handleSubmit}
                  className="flex w-full items-center gap-4 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                >
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                      Sin foto
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {producto.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                    {producto.tipo === "modelo" ? producto.marca : producto.categoria}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {producto.tipo === "modelo"
                      ? `Desde ${producto.precio}€`
                      : `${producto.precio}€`}
                  </div>
                </button>
              ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full border-t border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
}
