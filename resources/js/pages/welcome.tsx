import { Button } from "@/components/ui/button";
import  TarjetaProducto  from "@/components/TarjetaProducto";

export default function Welcome() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4 mb-6">
        <Button variant="delete">Borrar</Button>
        <Button variant="confirm">Confirmar</Button>
        <Button variant="default">Principal</Button>
        <Button variant="outlineGray">Botón 3</Button>
        <Button variant="outlinePurple">Botón 4</Button>
        <Button variant="secondary">Botón 2</Button>
      </div>

      <div className="flex flex-wrap gap-6 justify-start">
        <TarjetaProducto
          nombre="Iphone 15 pro max"
          precio={29.99}
          imagen="https://images.unsplash.com/photo-1695822822491-d92cee704368?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lJTIwMTUlMjBwcm8lMjBtYXh8ZW58MHx8MHx8fDA%3D"
        />
        <TarjetaProducto
          nombre="Iphone 15 pro max"
          precio={1129.99}
          imagen="https://external-preview.redd.it/apple-iphone-15-pro-max-review-more-camera-power-and-v0-uBnXQu7Iq_Rvm4WedHSJRXpvVqS-413_TyMFsjy8wXI.jpg?auto=webp&s=6f27b9a7b3e60a17833f49ebe6907e65cc706ae7"
        />
        <TarjetaProducto
          nombre="Iphone 15 pro max"
          precio={29.99}
          imagen="https://images.unsplash.com/photo-1695822822491-d92cee704368?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lJTIwMTUlMjBwcm8lMjBtYXh8ZW58MHx8MHx8fDA%3D"
        />
      </div>
    </div>
  );
}
