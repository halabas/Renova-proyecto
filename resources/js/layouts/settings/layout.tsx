import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { index as pedidosIndex } from '@/routes/pedidos';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Información',
        href: edit(),
        icon: null,
    },
    {
        title: 'Pedidos',
        href: pedidosIndex(),
        icon: null,
    },
    {
        title: 'Reparaciones',
        href: '/ajustes/reparaciones',
        icon: null,
    },
    {
        title: 'Contraseña',
        href: editPassword(),
        icon: null,
    },
    {
        title: 'Doble factor',
        href: show(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <Heading
                    title="Perfil"
                    description="Gestiona tu información y seguridad"
                />

                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    <aside className="w-full lg:w-64">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <nav className="flex flex-col space-y-2">
                                {sidebarNavItems.map((item, index) => (
                                    <Button
                                        key={`${resolveUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="outlineGray"
                                        asChild
                                        className={cn(
                                            'w-full justify-start text-slate-700',
                                            {
                                                'bg-slate-100 text-slate-900': isSameUrl(
                                                    currentPath,
                                                    item.href,
                                                ),
                                            },
                                        )}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <Separator className="lg:hidden" />

                    <div className="flex flex-1 justify-center">
                        <section className="w-full max-w-4xl space-y-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
