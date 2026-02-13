import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Home, Send } from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";


export default function ReparacionModal({ direcciones = [] }) {
  const { auth } = usePage().props;
  const direccionPredeterminada = direcciones.find((d) => d.predeterminada) || direcciones[0];
  const [abierto, setAbierto] = useState(false);
  const [modalidad, setModalidad] = useState("envio");
  const [errores, setErrores] = useState({});
  const { data, setData, post, processing, errors, reset } = useForm({
    direccion_id: direccionPredeterminada?.id || "",
    modelo_dispositivo: "",
    tipo_problema: "",
    descripcion: "",
    modalidad: "envio",
  });

  const enviar = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (!auth?.user) {
      nuevosErrores.general = "Debes iniciar sesión para solicitar una reparación.";
    }
    if (direcciones.length === 0 || !data.direccion_id) {
      nuevosErrores.direccion_id = "Selecciona una dirección válida.";
    }
    if (!String(data.modelo_dispositivo || "").trim()) {
      nuevosErrores.modelo_dispositivo = "El modelo del dispositivo es obligatorio.";
    } else if (String(data.modelo_dispositivo).trim().length < 3) {
      nuevosErrores.modelo_dispositivo = "El modelo del dispositivo debe tener al menos 3 caracteres.";
    }
    if (!String(data.tipo_problema || "").trim()) {
      nuevosErrores.tipo_problema = "Selecciona el tipo de problema.";
    }
    if (String(data.descripcion || "").length > 2000) {
      nuevosErrores.descripcion = "La descripción no puede superar 2000 caracteres.";
    }
    if (!["envio", "recogida"].includes(String(data.modalidad || ""))) {
      nuevosErrores.modalidad = "Selecciona una modalidad válida.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    post("/reparaciones/solicitudes", {
      onSuccess: () => {
        reset();
        setErrores({});
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
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border p-7 sm:max-w-4xl sm:p-8 lg:max-w-5xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Solicita tu <span className="text-violet-600">Reparación</span>
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Completa el formulario y nos pondremos en contacto contigo
          </DialogDescription>
        </DialogHeader>

        <form className="mt-8 space-y-7" onSubmit={enviar}>
          {errores.general ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {errores.general}
            </p>
          ) : null}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-slate-900">
              Dirección de recogida y contacto
            </h3>
            {!auth?.user ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Debes iniciar sesión para solicitar una reparación.
                <a href="/login" className="ml-2 font-semibold text-violet-600 underline">
                  Iniciar sesión
                </a>
              </div>
            ) : direcciones.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Necesitas al menos una dirección guardada.
                <a href="/ajustes/perfil" className="ml-2 font-semibold text-violet-600 underline">
                  Añadir dirección
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="mb-2 block text-base font-semibold text-slate-600">
                  Selecciona una dirección <span className="text-pink-500">*</span>
                </label>
                <Select
                  value={String(data.direccion_id)}
                  onValueChange={(valor) => setData("direccion_id", Number(valor))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    {direcciones.map((direccion) => (
                      <SelectItem key={direccion.id} value={String(direccion.id)}>
                        {direccion.etiqueta} · {direccion.nombre} {direccion.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errores.direccion_id || errors.direccion_id) ? (
                  <p className="mt-1 text-sm font-semibold text-red-500">
                    {errores.direccion_id || errors.direccion_id}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  Puedes editar tus direcciones en tu perfil.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium text-slate-900">
              Información del Dispositivo
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Modelo del dispositivo"
                required
                placeholder="Marca y modelo exactos"
                value={data.modelo_dispositivo}
                onChange={(e) => setData("modelo_dispositivo", e.target.value)}
                error={errores.modelo_dispositivo || errors.modelo_dispositivo}
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
                {(errores.tipo_problema || errors.tipo_problema) ? (
                  <p className="mt-1 text-sm font-semibold text-red-500">
                    {errores.tipo_problema || errors.tipo_problema}
                  </p>
                ) : null}
              </div>
            </div>
            <Textarea
              label="Describe el problema (opcional)"
              placeholder="Describe el problema con el máximo detalle posible para que podamos ayudarte mejor..."
              className="min-h-32"
              value={data.descripcion}
              onChange={(e) => setData("descripcion", e.target.value)}
              error={errores.descripcion || errors.descripcion}
            />
            {(errores.modalidad || errors.modalidad) ? (
              <p className="text-sm font-semibold text-red-500">
                {errores.modalidad || errors.modalidad}
              </p>
            ) : null}
          </div>

          <div className="space-y-5">
            <h3 className="text-xl font-medium text-slate-900">
              Modalidad de Reparación
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
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

          <div className="rounded-3xl border border-violet-200 bg-violet-50 px-6 py-6 text-center">
            <p className="text-sm text-slate-500">Precio de la revisión</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              30,00 €
            </p>
            <p className="mt-2 text-sm text-slate-500">
              La revisión y diagnóstico se descuenta automáticamente del presupuesto final. Si aceptas nuestro presupuesto, la revisión te sale gratis.
            </p>
          </div>

          <div className="flex justify-center pb-2">
            <Button
              size="lg"
              disabled={processing || !auth?.user || direcciones.length === 0 || !data.direccion_id}
            >
              {processing ? "Redirigiendo al pago..." : "Pagar revisión y solicitar reparación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
