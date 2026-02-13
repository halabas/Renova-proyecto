import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { UserMenuContent } from "@/components/user-menu-content";
import { useInitials } from "@/hooks/use-initials";
import { cn, isSameUrl } from "@/lib/utils";
import { Link, usePage } from "@inertiajs/react";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import AppLogo from "./app-logo";
import BarraBusqueda from "@/components/barra-busqueda";
const mainNavItems = [
  { title: "M\xF3viles", href: "/buscar?tipo=modelo" },
  { title: "Reparaciones", href: "/reparaciones" },
  { title: "Componentes", href: "/buscar?tipo=componente" }
];
const activeItemStyles = "text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";
const adminSecciones = [
  {
    titulo: "Catalogo",
    enlaces: [
      { href: "/admin/marcas", label: "Marcas" },
      { href: "/admin/modelos", label: "Modelos" },
      { href: "/admin/moviles", label: "Moviles" },
      { href: "/admin/componentes", label: "Componentes" },
      { href: "/admin/categorias", label: "Categorias" }
    ]
  },
  {
    titulo: "Gestion",
    enlaces: [
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/devoluciones", label: "Devoluciones" },
      { href: "/admin/solicitudes-reparacion", label: "Solicitudes" },
      { href: "/admin/usuarios", label: "Usuarios" },
      { href: "/admin/soporte", label: "Soporte" }
    ]
  }
];
function AppHeader({ breadcrumbs = [] }) {
  const page = usePage();
  const { auth, carritoResumen } = page.props;
  const getInitials = useInitials();
  return <>
      <div className="border-b border-sidebar-border/80">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">

          <Link href="/" prefetch className="flex items-center space-x-2">
            <AppLogo />
          </Link>

          <div className="flex-1 flex justify-center mt-[5px]">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {mainNavItems.map((item, index) => <NavigationMenuItem
    key={index}
    className="relative flex h-full items-center"
  >
                    <Link
    href={item.href}
    className={cn(
      navigationMenuTriggerStyle(),
      isSameUrl(page.url, item.href) && activeItemStyles,
      "h-9 cursor-pointer px-3"
    )}
  >
                      {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                      {item.title}
                    </Link>
                    {isSameUrl(page.url, item.href) && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />}
                  </NavigationMenuItem>)}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-5">
            <div className="hidden md:block">
      <BarraBusqueda />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outlineGray" className="group h-9 w-9 cursor-pointer">
                  <ShoppingCart className="size-5 opacity-80 group-hover:opacity-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="end">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-900">Carrito</p>
                  <p className="text-xs text-slate-500">
                    {carritoResumen?.cantidad || 0} productos
                  </p>
                </div>

                {carritoResumen?.productos?.length ? <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {carritoResumen.productos.map((producto) => <div key={producto.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{producto.nombre}</p>
                          {producto.detalle ? <p className="text-xs text-slate-500">{producto.detalle}</p> : null}
                          <p className="text-xs text-slate-500">
                            {producto.cantidad} x {producto.precio.toFixed(2)} €
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {(producto.precio * producto.cantidad).toFixed(2)} €
                        </p>
                      </div>)}
                  </div> : <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    Tu carrito está vacío.
                  </div>}

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm font-semibold text-slate-900">Subtotal</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {(carritoResumen?.subtotal || 0).toFixed(2)} €
                  </span>
                </div>
                <Link href="/carrito" className="mt-3 block">
                  <Button className="w-full" size="sm">
                    Ver carrito
                  </Button>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            {auth.user?.rol === "admin" ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outlineGray" className="group h-9 w-9 cursor-pointer">
                    <ShieldCheck className="size-5 opacity-80 group-hover:opacity-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[420px] max-h-[70vh] overflow-y-auto p-3" align="end">
                  <div className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Admin
                  </div>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {adminSecciones.map((seccion) => <div key={seccion.titulo} className="rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {seccion.titulo}
                        </p>
                        <div className="flex flex-col">
                          {seccion.enlaces.map((enlace) => <Link
    key={enlace.href}
    href={enlace.href}
    className="rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-white"
  >
                              {enlace.label}
                            </Link>)}
                        </div>
                      </div>)}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu> : null}
            {auth.user?.rol === "tecnico" ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outlineGray" className="group h-9 w-9 cursor-pointer">
                    <ShieldCheck className="size-5 opacity-80 group-hover:opacity-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tecnico
                  </div>
                  <div className="flex flex-col">
                    <Link href="/admin/solicitudes-reparacion" className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Solicitudes reparacion
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu> : null}
            {auth.user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outlineGray" className="size-10 rounded-full p-1">
                    <Avatar className="size-8 overflow-hidden rounded-full">
                      <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="rounded-lg bg-linear-to-r from-[#9747ff] to-[#ff2e88] text-white">
                        {getInitials(auth.user.name)}
                        </AvatarFallback>


                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
              </DropdownMenu> : <Link href="/login">
                <Button variant="default">Login</Button>
              </Link>}
          </div>
        </div>
      </div>

      {breadcrumbs.length > 1 && <div className="flex w-full border-b border-sidebar-border/70">
          <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>}
    </>;
}
export {
  AppHeader
};
