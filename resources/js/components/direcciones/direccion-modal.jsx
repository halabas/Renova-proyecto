import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";

const valoresIniciales = {
  etiqueta: "Casa",
  nombre: "",
  apellidos: "",
  dni: "",
  telefono: "",
  direccion: "",
  ciudad: "",
  provincia: "",
  codigo_postal: "",
  predeterminada: false,
};

export default function DireccionModal({ abierto, onAbiertoChange, direccion = null, onGuardado }) {
  const [errores, setErrores] = useState({});
  const {
    data: formDireccion,
    setData: setFormDireccion,
    post: guardarDireccion,
    patch: actualizarDireccion,
    processing: creandoDireccion,
    reset: resetDireccion,
    errors: erroresBackendDireccion,
    clearErrors,
  } = useForm(valoresIniciales);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    if (direccion) {
      setFormDireccion({
        etiqueta: direccion.etiqueta || "Casa",
        nombre: direccion.nombre || "",
        apellidos: direccion.apellidos || "",
        dni: direccion.dni || "",
        telefono: direccion.telefono || "",
        direccion: direccion.direccion || "",
        ciudad: direccion.ciudad || "",
        provincia: direccion.provincia || "",
        codigo_postal: direccion.codigo_postal || "",
        predeterminada: Boolean(direccion.predeterminada),
      });
    } else {
      resetDireccion();
      setFormDireccion("etiqueta", "Casa");
    }

    clearErrors();
    setErrores({});
  }, [abierto, direccion, setFormDireccion, resetDireccion, clearErrors]);

  const validarDireccion = () => {
    const nuevosErrores = {};
    if (!String(formDireccion.etiqueta || "").trim()) nuevosErrores.etiqueta = "La etiqueta es obligatoria.";
    if (!String(formDireccion.nombre || "").trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!String(formDireccion.apellidos || "").trim()) nuevosErrores.apellidos = "Los apellidos son obligatorios.";
    if (!/^\d{8}[A-Za-z]$/.test(String(formDireccion.dni || ""))) nuevosErrores.dni = "El DNI debe tener 8 números y una letra.";
    if (!/^\d{9}$/.test(String(formDireccion.telefono || ""))) nuevosErrores.telefono = "El teléfono debe tener 9 dígitos.";
    if (!String(formDireccion.direccion || "").trim()) nuevosErrores.direccion = "La dirección es obligatoria.";
    if (!String(formDireccion.ciudad || "").trim()) nuevosErrores.ciudad = "La ciudad es obligatoria.";
    if (!String(formDireccion.provincia || "").trim()) nuevosErrores.provincia = "La provincia es obligatoria.";
    if (!/^\d{5}$/.test(String(formDireccion.codigo_postal || ""))) nuevosErrores.codigo_postal = "El código postal debe tener 5 dígitos.";
    return nuevosErrores;
  };

  const guardar = () => {
    const nuevosErrores = validarDireccion();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    const onSuccess = () => {
      resetDireccion();
      clearErrors();
      setErrores({});
      onAbiertoChange(false);
      onGuardado?.();
    };

    if (direccion?.id) {
      actualizarDireccion(`/direcciones/${direccion.id}`, { onSuccess });
      return;
    }

    guardarDireccion("/direcciones", { onSuccess });
  };

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{direccion?.id ? "Editar dirección" : "Nueva dirección"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="etiqueta">Etiqueta</Label>
            <Input
              id="etiqueta"
              value={formDireccion.etiqueta}
              onChange={(e) => setFormDireccion("etiqueta", e.target.value)}
              placeholder="Casa / Trabajo"
            />
            <InputError message={errores.etiqueta || erroresBackendDireccion.etiqueta} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formDireccion.nombre}
                onChange={(e) => setFormDireccion("nombre", e.target.value)}
              />
              <InputError message={errores.nombre || erroresBackendDireccion.nombre} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                value={formDireccion.apellidos}
                onChange={(e) => setFormDireccion("apellidos", e.target.value)}
              />
              <InputError message={errores.apellidos || erroresBackendDireccion.apellidos} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={formDireccion.dni}
              onChange={(e) => setFormDireccion("dni", e.target.value.toUpperCase())}
              maxLength={9}
              placeholder="Ej: 12345678Z"
            />
            <InputError message={errores.dni || erroresBackendDireccion.dni} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formDireccion.telefono}
              onChange={(e) => setFormDireccion("telefono", e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={9}
              placeholder="Ej: 600000000"
            />
            <InputError message={errores.telefono || erroresBackendDireccion.telefono} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formDireccion.direccion}
              onChange={(e) => setFormDireccion("direccion", e.target.value)}
              placeholder="Calle y número"
            />
            <InputError message={errores.direccion || erroresBackendDireccion.direccion} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formDireccion.ciudad}
                onChange={(e) => setFormDireccion("ciudad", e.target.value)}
              />
              <InputError message={errores.ciudad || erroresBackendDireccion.ciudad} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={formDireccion.provincia}
                onChange={(e) => setFormDireccion("provincia", e.target.value)}
              />
              <InputError message={errores.provincia || erroresBackendDireccion.provincia} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="codigo_postal">Código postal</Label>
            <Input
              id="codigo_postal"
              value={formDireccion.codigo_postal}
              onChange={(e) => setFormDireccion("codigo_postal", e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="Ej: 41001"
            />
            <InputError message={errores.codigo_postal || erroresBackendDireccion.codigo_postal} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formDireccion.predeterminada}
              onChange={(e) => setFormDireccion("predeterminada", e.target.checked)}
            />
            Marcar como predeterminada
          </label>
          <Button disabled={creandoDireccion} onClick={guardar}>
            {direccion?.id ? "Guardar cambios" : "Guardar dirección"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
