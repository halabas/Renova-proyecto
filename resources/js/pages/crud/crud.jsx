import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Crud({ nombre_modelo, datos, columnas, campos, ObjetoEditando }) {
  const [editando, setEditando] = useState(!!ObjetoEditando);
  const [erroresFront, setErroresFront] = useState({});
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const valoresIniciales = { ...(ObjetoEditando || {}), fotos_archivos: [] };
  const { data: datosFormulario, setData, post, reset, errors, clearErrors } = useForm(valoresIniciales);

  const agregarArchivosFotos = (archivosNuevos) => {
    const actuales = Array.isArray(datosFormulario.fotos_archivos) ? datosFormulario.fotos_archivos : [];
    const mapa = new Map();

    [...actuales, ...archivosNuevos].forEach((archivo) => {
      if (!archivo) {
        return;
      }
      const clave = `${archivo.name}-${archivo.size}-${archivo.lastModified}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, archivo);
      }
    });

    setData('fotos_archivos', Array.from(mapa.values()));
  };

  const obtenerFotosExistentes = () => {
    return String(datosFormulario.fotos || '')
      .split(',')
      .map((foto) => foto.trim())
      .filter((foto) => foto !== '');
  };

  const quitarArchivoFoto = (indice) => {
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
      setErroresFront(nuevosErrores);
      return;
    }
    setErroresFront({});

    if (editando) {
      // Con archivos adjuntos, enviamos como POST + _method para que PHP procese bien el multipart.
      post(`/admin/${nombre_modelo}/${datosFormulario.id}`, {
        forceFormData: true,
        onSuccess: () => { reset(); setEditando(false); setErroresFront({}); clearErrors(); },
      });
    } else {
      post(`/admin/${nombre_modelo}`, {
        forceFormData: true,
        onSuccess: () => { reset(); setEditando(false); setErroresFront({}); clearErrors(); },
      });
    }
  };

  const modoEditar = (item) => {
    setEditando(true);
    setData({ ...item, _method: 'put', fotos_archivos: [] });
    setErroresFront({});
    clearErrors();
  };

  const cancelarEdicion = () => {
    reset();
    setEditando(false);
    setErroresFront({});
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

    router.delete(`/admin/${nombre_modelo}/${idAEliminar}`, {
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
            {nombre_modelo.toUpperCase()}
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
                      htmlFor="fotos_archivos"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const archivos = Array.from(e.dataTransfer.files || []);
                        agregarArchivosFotos(archivos);
                      }}
                      className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600"
                    >
                      Arrastra imágenes aquí o pulsa para seleccionarlas (puedes añadir más en varias veces)
                    </label>
                    <input
                      id="fotos_archivos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const archivos = Array.from(e.target.files || []);
                        agregarArchivosFotos(archivos);
                        e.target.value = '';
                      }}
                    />
                    {Array.isArray(datosFormulario.fotos_archivos) && datosFormulario.fotos_archivos.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          {datosFormulario.fotos_archivos.length} archivo(s) listo(s) para subir
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {datosFormulario.fotos_archivos.map((archivo, index) => (
                            <span key={`${archivo.name}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              {archivo.name}
                              <button
                                type="button"
                                onClick={() => quitarArchivoFoto(index)}
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
                    {erroresFront.fotos && !errors.fotos && !errors.fotos_archivos ? (
                      <p className="text-sm text-red-500">{erroresFront.fotos}</p>
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
                    error={erroresFront[camp.name] || errors[camp.name]}
                  />
                )}
                {(erroresFront[camp.name] || errors[camp.name]) && camp.type === 'select' ? (
                  <p className="text-sm text-red-500">{erroresFront[camp.name] || errors[camp.name]}</p>
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
