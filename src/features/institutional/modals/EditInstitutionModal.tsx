import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { X, Loader2, Save, Building2 } from "lucide-react";
import Swal from "sweetalert2";

// 1. Interfaces (Mantenidas)
interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
  status: boolean;
}

interface EditInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
  onInstitutionUpdated: (updated: Institution) => void;
}

// 2. Subcomponente elegante para campos de entrada
interface InputFieldProps {
  label: string;
  name: keyof Omit<Institution, 'id' | 'status'>; // Solo campos editables del form
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type, value, onChange, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-gray-700 font-medium mb-1.5 text-sm">
      {label}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition placeholder:text-gray-400 text-gray-800"
      required={required}
    />
  </div>
);

// 3. Componente Principal
export default function EditInstitutionModal({
  isOpen,
  onClose,
  institution,
  onInstitutionUpdated,
}: EditInstitutionModalProps) {
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    email: "",
    phone: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);

  // Sincronizar el estado del formulario cuando se abre el modal o la institución cambia
  useEffect(() => {
    if (institution) {
      setForm({
        name: institution.name || "",
        code: institution.code || "",
        address: institution.address || "",
        email: institution.email || "",
        phone: institution.phone || "",
        status: institution.status ?? true,
      });
    }
  }, [institution]);

  // Manejador genérico para todos los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Toggle de estado simple y optimizado
  const handleToggleStatus = useCallback(() => {
    setForm((prevForm) => ({
      ...prevForm,
      status: !prevForm.status,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validación simple de campos obligatorios
    if (!form.name || !form.code) {
        Swal.fire("Atención", "El nombre y el código son obligatorios.", "warning");
        setLoading(false);
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        Swal.fire("Error", "No se encontró el token de autenticación. Inicia sesión.", "error");
        setLoading(false);
        return;
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/api/institutions/${institution.id}`,
        form, // Enviar el objeto form completo (PUT)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data) {
        // Notificación de éxito
        Swal.fire("¡Actualizado!", "Los datos de la institución se guardaron correctamente.", "success");
        onInstitutionUpdated(response.data.data);
        onClose();
      } else {
        throw new Error("Respuesta inválida o incompleta del servidor.");
      }
    } catch (error) {
      console.error("Error al actualizar institución:", error);
      let message = "Ocurrió un error al intentar guardar los cambios.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        message = axiosError.response?.data?.message || message;
      }
      
      // Notificación de error elegante
      Swal.fire("Error al guardar", message, "error");

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // 4. Renderizado del Modal
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 transition-opacity duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 animate-slideIn border border-gray-100">
        
        {/* Header Elegante */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <Building2 className="w-6 h-6 text-blue-600" />
             <h2 className="text-xl font-bold text-gray-800">
                Editar Institución: {institution.name}
             </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <InputField label="Nombre de la Institución" name="name" type="text" value={form.name} onChange={handleChange} required />
          <InputField label="Código Único" name="code" type="text" value={form.code} onChange={handleChange} required />
          <InputField label="Dirección Completa" name="address" type="text" value={form.address} onChange={handleChange} />
          
          {/* Email y Teléfono en una sola fila (Opcional, para mejor uso del espacio) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Correo Electrónico" name="email" type="email" value={form.email} onChange={handleChange} />
            <InputField label="Teléfono" name="phone" type="text" value={form.phone} onChange={handleChange} />
          </div>

          {/* Estado Toggle Elegante y Centrado */}
          <div className="flex items-center justify-between pt-4 pb-2">
            <label className="text-gray-700 font-bold text-sm">
                Estado de la Institución
            </label>
            <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${form.status ? "text-green-600" : "text-red-500"}`}>
                    {form.status ? "Activo" : "Inactivo"}
                </span>
                <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`relative w-14 h-7 flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        form.status ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                    <span
                        className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                            form.status ? "translate-x-7" : "translate-x-0.5"
                        }`}
                        aria-hidden="true"
                    ></span>
                </button>
            </div>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200 disabled:opacity-60 disabled:shadow-none min-w-[150px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}