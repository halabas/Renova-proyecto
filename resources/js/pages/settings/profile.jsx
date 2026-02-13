import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import DireccionesLista from '@/components/direcciones/direcciones-lista';
import DireccionModal from '@/components/direcciones/direccion-modal';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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

    const abrirModalDireccion = (direccion = null) => {
        setDireccionEditando(direccion);
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
                            <Button
                                variant="outlineGray"
                                size="sm"
                                disabled={!puedeCrearDireccion}
                                onClick={() => abrirModalDireccion()}
                            >
                                Añadir dirección
                            </Button>
                        </div>

                        {direcciones.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                Aún no tienes direcciones guardadas.
                            </div>
                        ) : (
                            <DireccionesLista
                                direcciones={direcciones}
                                onEditar={abrirModalDireccion}
                                onEliminar={(direccion) =>
                                    router.delete(`/direcciones/${direccion.id}`)
                                }
                            />
                        )}

                        {!puedeCrearDireccion && (
                            <p className="mt-3 text-xs text-slate-500">
                                Máximo {maxDirecciones} direcciones por usuario.
                            </p>
                        )}
                    </div>
                    <DireccionModal
                        abierto={modalDireccionAbierto}
                        onAbiertoChange={(abierto) => {
                            setModalDireccionAbierto(abierto);
                            if (!abierto) {
                                setDireccionEditando(null);
                            }
                        }}
                        direccion={direccionEditando}
                        onGuardado={() => setDireccionEditando(null)}
                    />
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
