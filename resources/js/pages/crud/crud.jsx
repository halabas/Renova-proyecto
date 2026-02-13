import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Crud({ nombre_ruta, datos, columnas, campos }) {
  const [editando, setEditando] = useState(false);
  const [errores, setErrores] = useState({});
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const valoresIniciales = { fotos_archivos: [] };
  const { data: datosFormulario, setData, post, reset, errors, clearErrors } = useForm(valoresIniciales);

  const agregarFotos = (fotosNuevas) => {
    const actuales = Array.isArray(datosFormulario.fotos_archivos) ? datosFormulario.fotos_archivos : [];
    const nuevosValidos = (fotosNuevas || []).filter((foto) => foto != null);
    setData('fotos_archivos', [...actuales, ...nuevosValidos]);
  };

  const obtenerFotosExistentes = () => {
    return String(datosFormulario.fotos || '')
      .split(',')
      .map((foto) => foto.trim())
      .filter((foto) => foto !== '');
  };

  const quitarFotoNueva = (indice) => {
    const actuales = Array.isArray(datosFormulario.fotos_archivos) ? datosFormulario.fotos_archivos : [];
    setData(
      'fotos_archivos',
      actuales.filter((_, i) => i !== indice)
    );
  };

  const quitarFotoExistente = (indice) => {
    const fotosExistentes = obtenerFotosExistentes();
    const actualizadas = fotosExistentes.filter((_, i) => i !== indice);
    setData('fotos', actualizadas.join(','));
  };

  const actualizarCampo = (e) => setData(e.target.name, e.target.value);

  const enviarFormulario = (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    campos.forEach((camp) => {
      if (camp.name === 'id') {
        return;
      }
      if (camp.required === false) {
        return;
      }
      if (camp.name === 'fotos') {
        const urls = String(datosFormulario.fotos || '').trim();
        const archivos = Array.isArray(datosFormulario.fotos_archivos) ? datosFormulario.fotos_archivos : [];
        if (!urls && archivos.length === 0) {
          nuevosErrores[camp.name] = 'Debes añadir al menos una foto.';
        } else if (archivos.length > 5) {
          nuevosErrores[camp.name] = 'No puedes subir más de 5 fotos.';
        }
        return;
      }
      if (camp.type === 'number') {
        if (datosFormulario[camp.name] === '' || datosFormulario[camp.name] === null || datosFormulario[camp.name] === undefined) {
          nuevosErrores[camp.name] = `El campo ${camp.label} es obligatorio.`;
        } else if (camp.max !== undefined && Number(datosFormulario[camp.name]) > Number(camp.max)) {
          nuevosErrores[camp.name] = `El campo ${camp.label} no puede ser mayor que ${camp.max}.`;
        }
      } else if (!String(datosFormulario[camp.name] || '').trim()) {
        nuevosErrores[camp.name] = `El campo ${camp.label} es obligatorio.`;
      }
    });
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    if (editando) {
      post(`/admin/${nombre_ruta}/${datosFormulario.id}`, {
        forceFormData: true,
        onSuccess: () => { reset(); setEditando(false); setErrores({}); clearErrors(); },
      });
    } else {
      post(`/admin/${nombre_ruta}`, {
        forceFormData: true,
        onSuccess: () => { reset(); setEditando(false); setErrores({}); clearErrors(); },
      });
    }
  };

  const modoEditar = (item) => {
    setEditando(true);
    setData({ ...item, _method: 'put', fotos_archivos: [] });
    setErrores({});
    clearErrors();
  };

  const cancelarEdicion = () => {
    reset();
    setEditando(false);
    setErrores({});
    clearErrors();
  };

  const abrirModalEliminar = (id) => {
    setIdAEliminar(id);
    setModalEliminarAbierto(true);
  };

  const confirmarEliminar = () => {
    if (!idAEliminar) {
      return;
    }

    if (editando && Number(datosFormulario.id) === Number(idAEliminar)) {
      cancelarEdicion();
    }

    router.delete(`/admin/${nombre_ruta}/${idAEliminar}`, {
      onFinish: () => {
        setModalEliminarAbierto(false);
        setIdAEliminar(null);
      },
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {nombre_ruta.toUpperCase()}
          </h1>
        </div>

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
                {camp.name === 'fotos' ? (
                  <div className="space-y-2">
                    {obtenerFotosExistentes().length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          Fotos actuales
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {obtenerFotosExistentes().map((foto, index) => (
                            <span key={`${foto}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              {foto.split('/').pop()}
                              <button
                                type="button"
                                onClick={() => quitarFotoExistente(index)}
                                className="font-semibold text-slate-500 hover:text-red-500"
                                aria-label="Quitar foto actual"
                              >
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <label
                      htmlFor="foto"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fotos = Array.from(e.dataTransfer.files || []);
                        agregarFotos(fotos);
                      }}
                      className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600"
                    >
                      Arrastra imágenes aquí o pulsa para seleccionarlas (puedes añadir más en varias veces)
                    </label>
                    <input
                      id="foto"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const fotos = Array.from(e.target.files || []);
                        agregarFotos(fotos);
                        e.target.value = '';
                      }}
                    />
                    {Array.isArray(datosFormulario.fotos_archivos) && datosFormulario.fotos_archivos.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          {datosFormulario.fotos_archivos.length} foto(s) lista(s) para subir
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {datosFormulario.fotos_archivos.map((archivo, index) => (
                            <span key={`${archivo.name}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              {archivo.name}
                              <button
                                type="button"
                                onClick={() => quitarFotoNueva(index)}
                                className="font-semibold text-slate-500 hover:text-red-500"
                                aria-label={`Quitar ${archivo.name}`}
                              >
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {errors.fotos_archivos ? (
                      <p className="text-sm text-red-500">{errors.fotos_archivos}</p>
                    ) : null}
                    {errores.fotos && !errors.fotos && !errors.fotos_archivos ? (
                      <p className="text-sm text-red-500">{errores.fotos}</p>
                    ) : null}
                    {errors.fotos ? (
                      <p className="text-sm text-red-500">{errors.fotos}</p>
                    ) : null}
                  </div>
                ) : camp.type === 'select' ? (
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
                    max={camp.max}
                    onChange={actualizarCampo}
                    error={errores[camp.name] || errors[camp.name]}
                  />
                )}
                {(errores[camp.name] || errors[camp.name]) && camp.type === 'select' ? (
                  <p className="text-sm text-red-500">{errores[camp.name] || errors[camp.name]}</p>
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
                      <Button size="sm" variant="delete" onClick={() => abrirModalEliminar(objeto.id)}>
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

      <Dialog open={modalEliminarAbierto} onOpenChange={setModalEliminarAbierto}>
        <DialogContent className="rounded-2xl border-slate-200 p-6">
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. También puede borrar registros relacionados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outlineGray"
              onClick={() => {
                setModalEliminarAbierto(false);
                setIdAEliminar(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="delete" onClick={confirmarEliminar}>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
