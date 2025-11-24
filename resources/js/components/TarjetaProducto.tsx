import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TarjetaProductoProps {
  nombre: string;
  precio: number | string;
  imagen: string;
}

export default function TarjetaProducto({ nombre, precio, imagen }: TarjetaProductoProps) {
  return (
    <Card className=" cursor-pointer w-full max-w-[270px] sm:max-w-[300px] md:max-w-[250px] relative transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">
<CardHeader className="p-0">
  <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl">
    <img
      src={imagen}
      alt={nombre}
      className="w-full h-full object-cover"
    />
  </div>
</CardHeader>

      <CardContent className="px-4 pt-4 pb-2">
        <CardTitle className="text-2xl font-semibold">{nombre}</CardTitle>
    <p className="text-lg font-semibold bg-linear-to-r from-[#9747FF] to-[#FF2E88] bg-clip-text text-transparent max-w-20">
    {precio}€
    </p>
      </CardContent>

      <CardFooter className="px-2 flex flex-col gap-2">
        <div className="flex flex-wrap px-1.5 gap-2 justify-start">
          <Button
            asChild
            variant="outlinePurple"
            size="sm"
            className="hover:scale-100 active:scale-100 hover:shadow-none"
          >
            <a href="#">Rojo</a>
          </Button>
          <Button
            asChild
            variant="outlinePurple"
            size="sm"
            className="hover:scale-100 active:scale-100 hover:shadow-none"
          >
            <a href="#">256gb</a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
