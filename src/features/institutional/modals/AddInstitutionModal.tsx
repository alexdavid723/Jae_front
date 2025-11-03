import { useState, useCallback } from "react";
import { Building2, Loader2, X } from "lucide-react";
import Swal from "sweetalert2";
import type { Institution } from "../types"; // ✅ Importamos el tipo global
 // ✅ Importamos el tipo global

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstitutionAdded: (institution: Institution) => void;
}

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none shadow-sm placeholder:text-slate-400 transition duration-150 ease-in-out bg-white/90 backdrop-blur"
    required
  />
);

export default function AddInstitutionModal({
  isOpen,
  onClose,
  onInstitutionAdded,
}: AddInstitutionModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const clearForm = useCallback(() => {
    setName("");
    setCode("");
    setAddress("");
    setEmail("");
    setPhone("");
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !code || !address || !email || !phone) {
      Swal.fire("Atención", "Todos los campos son obligatorios.", "warning");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Sesión caducada. Inicia sesión nuevamente.");
      }

      const response = await fetch("http://localhost:4000/api/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code, address, email, phone }),
      });

      if (!response.ok) {
        let errorMessage = "Error al agregar la institución.";
        if (response.status === 401)
          errorMessage = "No autorizado. Inicia sesión nuevamente.";
        else if (response.status === 403)
          errorMessage = "No tienes permisos para realizar esta acción.";
        else if (response.status === 409)
          errorMessage = "Ya existe una institución con ese código o nombre.";
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data?.data) {
        throw new Error("Respuesta del servidor inválida.");
      }

      // ✅ Añadimos `status` por defecto para evitar errores de tipo
      const newInst: Institution = { ...data.data, status: true };

      onInstitutionAdded(newInst);
      clearForm();
      onClose();

      Swal.fire("¡Éxito!", "La institución fue agregada correctamente.", "success");
    } catch (error: unknown) {
      console.error("Error al agregar institución:", error);
      const message =
        error instanceof Error ? error.message : "Error desconocido. Intenta de nuevo.";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🎨 Fondo más claro y elegante
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-fadeIn scale-100 border border-slate-100">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-sky-100 rounded-full">
            <Building2 className="w-6 h-6 text-sky-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Registrar Nueva Institución
          </h2>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4">
          <InputField
            type="text"
            placeholder="Nombre de la Institución (Ej: CETPRO La Merced)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            type="text"
            placeholder="Código Único (Ej: C7101825)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <InputField
            type="text"
            placeholder="Dirección Completa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <InputField
            type="email"
            placeholder="Correo Electrónico (Ej: cetpro.lamerced@gob.pe)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            type="text"
            placeholder="Teléfono (Ej: 01-330-5809)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 transition shadow-md shadow-sky-200 disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Agregar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
