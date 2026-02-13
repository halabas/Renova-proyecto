import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import AppLogo from "./app-logo";
const footerLinkClass = "text-sm text-muted-foreground hover:text-accent transition-colors";
function Footer() {
  return <footer className="bg-background border-t border-sidebar-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <AppLogo />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Compra, repara o renueva con Renova al mejor precio.
            </p>

            <div className="flex gap-2">
            <Button size="icon" variant="outlineGray">
                <Facebook className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button size="icon" variant="outlineGray">
                <Twitter className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button size="icon" variant="outlineGray">
                <Instagram className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button size="icon" variant="outlineGray">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
            </Button>
            </div>

          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Productos</h4>
            <ul className="space-y-2">
              <li><Link className={footerLinkClass} href="/buscar?tipo=modelo">Móviles</Link></li>
              <li><Link className={footerLinkClass} href="/buscar?tipo=componente">Componentes</Link></li>
              <li><Link className={footerLinkClass} href="/reparaciones">Reparaciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Sobre Nosotros</h4>
            <ul className="space-y-2">
              <li><Link className={footerLinkClass} href="/nuestra-historia">Nuestra Historia</Link></li>
              <li><Link className={footerLinkClass} href="/politica-de-privacidad">Política de Privacidad</Link></li>
              <li><Link className={footerLinkClass} href="/terminos-y-condiciones">Términos y Condiciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Contacto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:pablo.galo@iesdonana.org">pablo.galo@iesdonana.org</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+34635975107">+34 635 97 51 07</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Calle Rio Betis 13, Sanlúcar, España</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-sidebar-border/70 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>Copyright © 2025 Renova Tecnología</p>
        </div>
      </div>
    </footer>;
}
export {
  Footer
};
