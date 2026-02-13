import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({
    status,
    canResetPassword,
    canRegister,
}) {
    const [erroresFront, setErroresFront] = useState({});

    const validarFrontend = (event) => {
        const formulario = event.currentTarget;
        const datos = new FormData(formulario);
        const email = String(datos.get('email') || '').trim();
        const password = String(datos.get('password') || '');
        const nuevosErrores = {};

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

        if (Object.keys(nuevosErrores).length > 0) {
            event.preventDefault();
            setErroresFront(nuevosErrores);
            return;
        }

        setErroresFront({});
    };

    return (
        <AuthLayout
            title="Inicia sesión"
            description="Introduce tu correo y contraseña para acceder"
        >
            <Head title="Iniciar sesión" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
                onSubmit={validarFrontend}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    minLength={5}
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="correo@ejemplo.com"
                                    onInput={() =>
                                        setErroresFront((prev) => ({ ...prev, email: null }))
                                    }
                                />
                                <InputError message={erroresFront.email || errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Tu contraseña"
                                    onInput={() =>
                                        setErroresFront((prev) => ({ ...prev, password: null }))
                                    }
                                />
                                <InputError message={erroresFront.password || errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Recuérdame</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Entrar
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                ¿No tienes cuenta?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Regístrate
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
