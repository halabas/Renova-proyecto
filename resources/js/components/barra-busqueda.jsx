import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { cn } from "@/lib/utils";

function ItemSugerencia({ producto }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded cursor-pointer">
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex flex-col">
        <span className="font-semibold text-base">{producto.nombre}</span>
        <span className="text-sm text-gray-600">{producto.precio}€</span>
      </div>
    </div>
  );
}

export default function BarraBusqueda({ productos }) {
  const [valor, setValor] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  const getSugerencias = (inputValue) => {
    const inputLower = inputValue.trim().toLowerCase();
    return productos
      .filter((p) => p.nombre.toLowerCase().includes(inputLower))
      .slice(0, 5);
  };


  const renderSugerencia = (producto) => <ItemSugerencia producto={producto} />;

  return (
    <div className="relative w-full">
<Autosuggest
  suggestions={sugerencias}
  onSuggestionsFetchRequested={({ value }) => setSugerencias(getSugerencias(value))}
  onSuggestionsClearRequested={() => setSugerencias([])}
  getSuggestionValue={(producto) => producto.nombre}
  renderSuggestion={renderSugerencia}
  inputProps={{
    placeholder: "Busca un producto...",
    value: valor,
    onChange: (_, { newValue }) => setValor(newValue),
    className: cn(
      "w-full rounded-[20px] border-2 border-[#d9d9d9] px-5 py-3 text-[16px] shadow-xs outline-none focus:border-transparent focus:ring-2 focus:ring-[#9747ff]"
    ),
  }}
  theme={{
    suggestionsContainer:
      "absolute z-50 mt-2 left-0 w-full max-h-[500px] overflow-auto bg-gray-100 rounded-lg shadow-lg",
    suggestionsList: "flex flex-col",
    suggestion: "w-full",
  }}
/>
    </div>
  );
}
