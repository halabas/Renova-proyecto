import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/renova-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs = [
    {
        title: 'Perfil',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }) {
    const { auth, direcciones = [] } = usePage().props;

    const maxDirecciones = 3;
    const puedeCrearDireccion = direcciones.length < maxDirecciones;
    const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);
    const [direccionEditando, setDireccionEditando] = useState(null);

    const {
        data: formDireccion,
        setData: setFormDireccion,
        post: guardarDireccion,
        patch: actualizarDireccion,
        processing: creandoDireccion,
        reset: resetDireccion,
        errors: erroresDireccion,
        clearErrors,
    } = useForm({
        etiqueta: 'Casa',
        nombre: '',
        apellidos: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        predeterminada: false,
    });

    const abrirModalDireccion = (direccion = null) => {
        if (direccion) {
            setDireccionEditando(direccion.id);
            setFormDireccion({
                etiqueta: direccion.etiqueta || 'Casa',
                nombre: direccion.nombre || '',
                apellidos: direccion.apellidos || '',
                telefono: direccion.telefono || '',
                direccion: direccion.direccion || '',
                ciudad: direccion.ciudad || '',
                provincia: direccion.provincia || '',
                codigo_postal: direccion.codigo_postal || '',
                predeterminada: Boolean(direccion.predeterminada),
            });
        } else {
            setDireccionEditando(null);
            resetDireccion();
            setFormDireccion('etiqueta', 'Casa');
        }
        clearErrors();
        setModalDireccionAbierto(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Información del perfil"
                        description="Actualiza tu nombre y correo electrónico"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre completo</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Tu nombre y apellidos"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="correo@ejemplo.com"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Tu correo no está verificado.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Haz clic aquí para reenviar
                                                    el correo de verificación.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Te hemos enviado un nuevo
                                                    enlace de verificación.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Guardado
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="space-y-6">
                    <HeadingSmall
                        title="Direcciones"
                        description="Gestiona las direcciones de envío de tu cuenta."
                    />

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Direcciones guardadas
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Puedes guardar hasta {maxDirecciones}{' '}
                                    direcciones.
                                </p>
                            </div>
                            <Dialog
                                open={modalDireccionAbierto}
                                onOpenChange={setModalDireccionAbierto}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outlineGray"
                                        size="sm"
                                        disabled={!puedeCrearDireccion}
                                        onClick={() => abrirModalDireccion()}
                                    >
                                        Añadir dirección
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {direccionEditando
                                                ? 'Editar dirección'
                                                : 'Nueva dirección'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="etiqueta">
                                                Etiqueta
                                            </Label>
                                            <Input
                                                id="etiqueta"
                                                value={formDireccion.etiqueta}
                                                onChange={(e) =>
                                                    setFormDireccion(
                                                        'etiqueta',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Casa / Trabajo"
                                            />
                                            <InputError
                                                message={
                                                    erroresDireccion.etiqueta
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nombre">
                                                    Nombre
                                                </Label>
                                                <Input
                                                    id="nombre"
                                                    value={formDireccion.nombre}
                                                    onChange={(e) =>
                                                        setFormDireccion(
                                                            'nombre',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        erroresDireccion.nombre
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="apellidos">
                                                    Apellidos
                                                </Label>
                                                <Input
                                                    id="apellidos"
                                                    value={
                                                        formDireccion.apellidos
                                                    }
                                                    onChange={(e) =>
                                                        setFormDireccion(
                                                            'apellidos',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        erroresDireccion.apellidos
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="telefono">
                                                Teléfono
                                            </Label>
                                            <Input
                                                id="telefono"
                                                value={formDireccion.telefono}
                                                onChange={(e) =>
                                                    setFormDireccion(
                                                        'telefono',
                                                        e.target.value,
                                                    )
                                                }
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={9}
                                                placeholder="Ej: 600000000"
                                            />
                                            <InputError
                                                message={
                                                    erroresDireccion.telefono
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="direccion">
                                                Dirección
                                            </Label>
                                            <Input
                                                id="direccion"
                                                value={formDireccion.direccion}
                                                onChange={(e) =>
                                                    setFormDireccion(
                                                        'direccion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Calle y número"
                                            />
                                            <InputError
                                                message={
                                                    erroresDireccion.direccion
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="ciudad">
                                                    Ciudad
                                                </Label>
                                                <Input
                                                    id="ciudad"
                                                    value={formDireccion.ciudad}
                                                    onChange={(e) =>
                                                        setFormDireccion(
                                                            'ciudad',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        erroresDireccion.ciudad
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="provincia">
                                                    Provincia
                                                </Label>
                                                <Input
                                                    id="provincia"
                                                    value={
                                                        formDireccion.provincia
                                                    }
                                                    onChange={(e) =>
                                                        setFormDireccion(
                                                            'provincia',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        erroresDireccion.provincia
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="codigo_postal">
                                                Código postal
                                            </Label>
                                            <Input
                                                id="codigo_postal"
                                                value={
                                                    formDireccion.codigo_postal
                                                }
                                                onChange={(e) =>
                                                    setFormDireccion(
                                                        'codigo_postal',
                                                        e.target.value,
                                                    )
                                                }
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={5}
                                                placeholder="Ej: 41001"
                                            />
                                            <InputError
                                                message={
                                                    erroresDireccion.codigo_postal
                                                }
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    formDireccion.predeterminada
                                                }
                                                onChange={(e) =>
                                                    setFormDireccion(
                                                        'predeterminada',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            Marcar como predeterminada
                                        </label>
                                        <Button
                                            disabled={creandoDireccion}
                                            onClick={() =>
                                                (direccionEditando
                                                    ? actualizarDireccion(
                                                          `/direcciones/${direccionEditando}`,
                                                          {
                                                              onSuccess: () => {
                                                                  resetDireccion();
                                                                  clearErrors();
                                                                  setDireccionEditando(
                                                                      null,
                                                                  );
                                                                  setModalDireccionAbierto(
                                                                      false,
                                                                  );
                                                              },
                                                          },
                                                      )
                                                    : guardarDireccion(
                                                          '/direcciones',
                                                          {
                                                              onSuccess: () => {
                                                                  resetDireccion();
                                                                  clearErrors();
                                                                  setModalDireccionAbierto(
                                                                      false,
                                                                  );
                                                              },
                                                          },
                                                      ))
                                            }
                                        >
                                            {direccionEditando
                                                ? 'Guardar cambios'
                                                : 'Guardar dirección'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {direcciones.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                Aún no tienes direcciones guardadas.
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-3">
                                {direcciones.map((direccion) => (
                                    <div
                                        key={direccion.id}
                                        className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {direccion.etiqueta} ·{' '}
                                                    {direccion.nombre}{' '}
                                                    {direccion.apellidos}
                                                </p>
                                                {direccion.predeterminada && (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                                                        Predeterminada
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {direccion.direccion},{' '}
                                                {direccion.codigo_postal}{' '}
                                                {direccion.ciudad},{' '}
                                                {direccion.provincia}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Tel: {direccion.telefono}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() =>
                                                    abrirModalDireccion(
                                                        direccion,
                                                    )
                                                }
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="delete"
                                                size="sm"
                                                onClick={() =>
                                                    router.delete(
                                                        `/direcciones/${direccion.id}`,
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!puedeCrearDireccion && (
                            <p className="mt-3 text-xs text-slate-500">
                                Máximo {maxDirecciones} direcciones por usuario.
                            </p>
                        )}
                    </div>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
