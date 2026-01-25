export default function FiltroSelect({ valor, opciones, onChange }) {
  return (
    <div>
      <div className="mt-3">
        <select
          value={valor ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          style={{ outlineColor: "#9747FF" }}
        >
          {opciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
