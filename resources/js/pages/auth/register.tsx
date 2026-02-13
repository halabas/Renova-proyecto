import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { type FormEvent, useState } from 'react';

export default function Register() {
    const [errores, setErrores] = useState<Record<string, string | null>>({});

    const validarFrontend = (event: FormEvent<HTMLFormElement>) => {
        const formulario = event.currentTarget;
        const datos = new FormData(formulario);
        const name = String(datos.get('name') || '').trim();
        const email = String(datos.get('email') || '').trim();
        const password = String(datos.get('password') || '');
        const passwordConfirmation = String(datos.get('password_confirmation') || '');
        const nuevosErrores: Record<string, string> = {};

        if (!name) {
            nuevosErrores.name = 'El nombre es obligatorio.';
        } else if (name.length < 3) {
            nuevosErrores.name = 'El nombre debe tener al menos 3 caracteres.';
        }

        if (!email) {
            nuevosErrores.email = 'El correo electrónico es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevosErrores.email = 'Introduce un correo electrónico válido.';
        }

        if (!password) {
            nuevosErrores.password = 'La contraseña es obligatoria.';
        } else if (password.length < 8) {
            nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if (!passwordConfirmation) {
            nuevosErrores.password_confirmation = 'Confirma tu contraseña.';
        } else if (password !== passwordConfirmation) {
            nuevosErrores.password_confirmation = 'La confirmación de contraseña no coincide.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            event.preventDefault();
            setErrores(nuevosErrores);
            return;
        }

        setErrores({});
    };

    return (
        <AuthLayout
            title="Crear cuenta"
            description="Introduce tus datos para crear tu cuenta"
        >
            <Head title="Crear cuenta" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
                onSubmit={validarFrontend}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    minLength={3}
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Tu nombre y apellidos"
                                    onInput={() =>
                                        setErrores((prev) => ({ ...prev, name: null }))
                                    }
                                />
                                <InputError
                                    message={errores.name || errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    minLength={5}
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    onInput={() =>
                                        setErrores((prev) => ({ ...prev, email: null }))
                                    }
                                />
                                <InputError message={errores.email || errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Crea una contraseña"
                                    onInput={() =>
                                        setErrores((prev) => ({ ...prev, password: null }))
                                    }
                                />
                                <InputError message={errores.password || errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    minLength={8}
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repite la contraseña"
                                    onInput={() =>
                                        setErrores((prev) => ({ ...prev, password_confirmation: null }))
                                    }
                                />
                                <InputError
                                    message={errores.password_confirmation || errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Inicia sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
