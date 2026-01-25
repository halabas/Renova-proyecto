export default function FiltroRadio({ nombre, opciones, valor, onChange }) {
  return (
    <div>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        {opciones.map((opcion) => (
          <label key={opcion.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={nombre}
              checked={valor === opcion.value}
              onChange={() => onChange(opcion.value)}
              className="accent-[#9747FF]"
            />
            <span>{opcion.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
