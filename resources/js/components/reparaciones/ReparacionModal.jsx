import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Home, Send } from "lucide-react";
import { useForm } from "@inertiajs/react";


export default function ReparacionModal() {
  const [abierto, setAbierto] = useState(false);
  const [modalidad, setModalidad] = useState("envio");
  const { data, setData, post, processing, errors, reset } = useForm({
    nombre_completo: "",
    telefono: "",
    email: "",
    modelo_dispositivo: "",
    tipo_problema: "",
    descripcion: "",
    modalidad: "envio",
  });

  const enviar = (e) => {
    e.preventDefault();
    post("/reparaciones/solicitudes", {
      onSuccess: () => {
        reset();
        setModalidad("envio");
        setAbierto(false);
      },
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>Seleccionar reparación</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen w-full max-w-6xl overflow-y-auto rounded-2xl border p-8 sm:max-w-6xl sm:p-10">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Solicita tu <span className="text-violet-600">Reparación</span>
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Completa el formulario y nos pondremos en contacto contigo
          </DialogDescription>
        </DialogHeader>

        <form className="mt-10 space-y-8" onSubmit={enviar}>
          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-slate-900">
              Información Personal
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Nombre completo"
                required
                placeholder="Nombre y apellidos"
                value={data.nombre_completo}
                onChange={(e) => setData("nombre_completo", e.target.value)}
                error={errors.nombre_completo}
              />
              <Input
                label="Teléfono"
                required
                placeholder="Número con prefijo"
                value={data.telefono}
                onChange={(e) => setData("telefono", e.target.value)}
                error={errors.telefono}
              />
            </div>
            <Input
              label="Email"
              required
              placeholder="tu@correo.com"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              error={errors.email}
            />
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-medium text-slate-900">
              Información del Dispositivo
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Modelo del dispositivo"
                required
                placeholder="Marca y modelo exactos"
                value={data.modelo_dispositivo}
                onChange={(e) => setData("modelo_dispositivo", e.target.value)}
                error={errors.modelo_dispositivo}
              />
              <div className="w-full">
                <label className="mb-2 block text-base font-semibold text-slate-600">
                  Tipo de problema <span className="text-pink-500">*</span>
                </label>
                <Select
                  value={data.tipo_problema}
                  onValueChange={(valor) => setData("tipo_problema", valor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el problema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pantalla">Pantalla</SelectItem>
                    <SelectItem value="bateria">Batería</SelectItem>
                    <SelectItem value="camara">Cámara</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="conectividad">Conectividad</SelectItem>
                    <SelectItem value="agua">Daño por agua</SelectItem>
                    <SelectItem value="placa">Placa base</SelectItem>
                    <SelectItem value="otros">Otras reparaciones</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_problema ? (
                  <p className="mt-1 text-sm font-semibold text-red-500">{errors.tipo_problema}</p>
                ) : null}
              </div>
            </div>
            <Textarea
              label="Describe el problema (opcional)"
              placeholder="Describe el problema con el máximo detalle posible para que podamos ayudarte mejor..."
              className="min-h-36"
              value={data.descripcion}
              onChange={(e) => setData("descripcion", e.target.value)}
              error={errors.descripcion}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-slate-900">
              Modalidad de Reparación
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Button
                type="button"
                variant="tarjeta"
                onClick={() => {
                  setModalidad("envio");
                  setData("modalidad", "envio");
                }}
                className={modalidad === "envio" ? "border-violet-400 bg-violet-50 shadow-md" : ""}
              >
                {modalidad === "envio"}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-600">
                  <Send className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Envío del teléfono
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Te enviamos instrucciones para que nos envíes tu dispositivo
                </p>
              </Button>

              <Button
                type="button"
                variant="tarjeta"
                onClick={() => {
                  setModalidad("recogida");
                  setData("modalidad", "recogida");
                }}
                className={modalidad === "recogida" ? "border-violet-400 bg-violet-50 shadow-md" : ""}
              >
                {modalidad === "recogida"}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-600">
                  <Home className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Recogida a domicilio
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Recogemos tu dispositivo en Sanlúcar de Barrameda
                </p>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-violet-50 px-6 py-7 text-center">
            <p className="text-sm text-slate-500">Precio de la reparación</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              A consultar
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Te enviaremos un presupuesto personalizado sin compromiso
            </p>
          </div>

          <div className="flex justify-center pb-2">
            <Button size="lg" disabled={processing}>
              {processing ? "Enviando..." : "Solicitar Reparación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
