import { useEffect, useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Crud({ nombre_modelo, datos, columnas, campos, ObjetoEditando }) {
  const { flash } = usePage().props;
  const [editando, setEditando] = useState(!!ObjetoEditando);
  const [mensaje, setMensaje] = useState(flash.success);
  const { data: datosFormulario, setData, post, put, reset, errors } = useForm(ObjetoEditando || {});

  useEffect(() => {
    setMensaje(flash.success);
    if (flash.success) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash.success]);

  const actualizarCampo = (e) => setData(e.target.name, e.target.value);

  const enviarFormulario = (e) => {
    e.preventDefault();

    if (editando) {
      put(`/admin/${nombre_modelo}/${datosFormulario.id}`, {
        onSuccess: () => { reset(); setEditando(false); },
      });
    } else {
      post(`/admin/${nombre_modelo}`, {
        onSuccess: () => { reset(); setEditando(false); },
      });
    }
  };

  const modoEditar = (item) => {
    setEditando(true);
    setData(item);
  };

  const cancelarEdicion = () => {
    reset();
    setEditando(false);
  };

  const eliminar = (id) => {
    if (confirm('¿Seguro que quieres eliminarlo? Borrará también los registros relacionados.')) {
      router.delete(`/admin/${nombre_modelo}/${id}`);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {nombre_modelo.toUpperCase()}
          </h1>
        </div>

        {mensaje && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <span className="text-sm font-medium">{mensaje}</span>
            <button onClick={() => setMensaje(null)} className="text-sm font-semibold">Cerrar</button>
          </div>
        )}

        <div className="mb-8 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {editando ? 'Editar registro' : 'Crear registro'}
          </h2>
          <p className="text-sm text-slate-500">
            Completa los campos y guarda los cambios.
          </p>

          <form onSubmit={enviarFormulario} className="mt-6 grid gap-4 md:grid-cols-2">
            {campos.map((camp) => (
              <div key={camp.name} className="flex flex-col gap-2">
                <Label htmlFor={camp.name}>{camp.label}</Label>
                {camp.type === 'select' ? (
                  <select
                    id={camp.name}
                    name={camp.name}
                    value={datosFormulario[camp.name] || ''}
                    onChange={actualizarCampo}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-transparent focus:ring-2 focus:ring-violet-400"
                  >
                    <option value="">Selecciona una opción</option>
                    {camp.options.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={camp.name}
                    name={camp.name}
                    type={camp.type || 'text'}
                    value={datosFormulario[camp.name] || ''}
                    onChange={actualizarCampo}
                    error={errors[camp.name]}
                  />
                )}
                {errors[camp.name] && camp.type === 'select' ? (
                  <p className="text-sm text-red-500">{errors[camp.name]}</p>
                ) : null}
              </div>
            ))}

            <div className="mt-4 flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit">{editando ? 'Actualizar' : 'Crear'}</Button>
              {editando && (
                <Button type="button" variant="outlineGray" onClick={cancelarEdicion}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-center text-xs font-semibold uppercase text-slate-500">
              <tr>
                {columnas.map((col) => (
                  <th key={col} className="px-4 py-3">{col}</th>
                ))}
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos.map((objeto) => (
                <tr key={objeto.id} className="hover:bg-slate-50 text-center">
                  {columnas.map((col) => (
                    <td key={col} className="px-4 py-3 text-slate-700">
                      {objeto[col]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button size="sm" variant="outlineGray" onClick={() => modoEditar(objeto)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="delete" onClick={() => eliminar(objeto.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
