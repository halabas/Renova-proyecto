export default function BarraLateral({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {titulo && <div className="text-sm font-semibold text-slate-900">{titulo}</div>}
      {children}
    </div>
  );
}
