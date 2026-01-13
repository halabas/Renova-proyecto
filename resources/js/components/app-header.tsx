import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, isSameUrl } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Search, ShoppingCart } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  { title: 'Móviles', href: '/productos' },
  { title: 'Reparaciones', href: '/reparaciones' },
  { title: 'Componentes', href: '/componentes' },
  { title: 'Blog', href: '/blog' },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export function AppHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
  const page = usePage<SharedData>();
  const { auth } = page.props;
  const getInitials = useInitials();

  return (
    <>
      <div className="border-b border-sidebar-border/80">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">

          <Link href="/" prefetch className="flex items-center space-x-2">
            <AppLogo />
          </Link>

          <div className="flex-1 flex justify-center mt-[5px]">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {mainNavItems.map((item, index) => (
                  <NavigationMenuItem
                    key={index}
                    className="relative flex h-full items-center"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isSameUrl(page.url, item.href) && activeItemStyles,
                        'h-9 cursor-pointer px-3'
                      )}
                    >
                      {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                      {item.title}
                    </Link>
                    {isSameUrl(page.url, item.href) && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-5">

            <Button size="icon" variant="outlineGray" className="group h-9 w-9 cursor-pointer">
              <Search className="size-5 opacity-80 group-hover:opacity-100" />
            </Button>
            <Button size="icon" variant="outlineGray" className="group h-9 w-9 cursor-pointer">
              <ShoppingCart className="size-5 opacity-80 group-hover:opacity-100" />
            </Button>
            {auth.user ? (
              <DropdownMenu>
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
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {breadcrumbs.length > 1 && (
        <div className="flex w-full border-b border-sidebar-border/70">
          <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      )}
    </>
  );
}
