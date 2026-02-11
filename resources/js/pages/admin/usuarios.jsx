import AppLayout from '@/layouts/renova-layout';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';

export default function Usuarios({ usuarios }) {
  return (
    <AppLayout>
      <Head title="Usuarios" />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">
            Gestiona usuarios y permisos de administrador.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{usuario.id}</td>
                  <td className="px-4 py-3 text-slate-700">{usuario.name}</td>
                  <td className="px-4 py-3 text-slate-700">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        usuario.rol === 'admin'
                          ? 'bg-violet-50 text-violet-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {usuario.deleted_at ? 'Eliminado' : 'Activo'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {usuario.deleted_at ? (
                      <Button size="sm" variant="outlineGray" disabled>
                        Eliminado
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="delete"
                        onClick={() => router.delete(`/admin/usuarios/${usuario.id}`)}
                      >
                        Eliminar
                      </Button>
                    )}
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
