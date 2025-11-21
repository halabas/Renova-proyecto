import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function Crud({ nombre_modelo, datos, columnas, campos, ObjetoEditando }) {
  const [editando, setEditando] = useState(!!ObjetoEditando);
  const { data: datosFormulario, setData, post, put, reset, errors } = useForm(ObjetoEditando || {});

  // Actualiza los campos del formulario a la hora de realizar una acción en este.
  const actualizarCampo = (e) => setData(e.target.name, e.target.value);

  // Se encarga de modificar el formulario dependiendo de si se está editando o creando un nuevo registro.
  const enviarFormulario = (e) => {
    e.preventDefault();

    if (editando) {
      put(`/${nombre_modelo}/${datosFormulario.id}`, {
        onSuccess: () => { reset(); setEditando(false); },
      });
    } else {
      post(`/${nombre_modelo}`, {
        onSuccess: () => { reset(); setEditando(false); },
      });
    }
  };

  // Función que se encarga de activar el modo edición del formulario.
  const modoEditar = (item) => {
    setEditando(true);
    setData(item);
  };

  // Cancela la edición y borra el formulario
  const cancelarEdicion = () => {
    reset();
    setEditando(false);
  };

  // Elimina un registro con confirmación
  const eliminar = (id) => {
    if (confirm('¿Seguro que quieres eliminarlo? Borrara tambien los registros relacionados.')) {
      router.delete(`/${nombre_modelo}/${id}`);
    }
  };
    // Estilos temporales
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{nombre_modelo.toUpperCase()}</h1>

      <form onSubmit={enviarFormulario} className="mb-6 border p-4 rounded">
        {campos.map((camp) => (
          <div key={camp.name} className="mb-2">
            <label className="block font-medium ">{camp.label}</label>
            {camp.type === 'select' ? (
              <select
                name={camp.name}
                value={datosFormulario[camp.name] || ''}
                onChange={actualizarCampo}
                className="border rounded px-2 py-1 w-full "
              >
                <option className="text-black" value="">Selecciona una opción</option>
                {camp.options.map((opcion) => (
                  <option key={opcion.value} value={opcion.value} className='text-black'>
                    {opcion.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={camp.type || 'text'}
                name={camp.name}
                value={datosFormulario[camp.name] || ''}
                onChange={actualizarCampo}
                className="border rounded px-2 py-1 w-full"
              />
            )}

            {errors[camp.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[camp.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editando ? 'Actualizar' : 'Crear'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col} className="border px-2 py-1">{col.toUpperCase()}</th>
            ))}
            <th className="border px-2 py-1">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((objeto) => (
            <tr key={objeto.id}>
              {columnas.map((col) => (
                <td key={col} className="border px-2 py-1">{objeto[col]}</td>
              ))}
              <td className="border px-2 py-1 flex gap-2">
                <button
                  onClick={() => modoEditar(objeto)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(objeto.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
