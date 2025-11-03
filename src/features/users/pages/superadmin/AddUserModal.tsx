import { useState, useCallback } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import axios from "axios"; 
import Swal from "sweetalert2";
// Asumimos que Swal está disponible globalmente.

// ----------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Función para refrescar la lista en la tabla principal
  onUserAdded: () => void; 
}

interface InputFieldProps {
    id: string;
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
    children?: React.ReactNode;
}

// Lista de roles disponibles
const availableRoles = ["superadmin", "admin"];

// ----------------------------------------------------------------------
// Componente de Campo de Formulario
// ----------------------------------------------------------------------

const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    type,
    name,
    value,
    onChange,
    required = false,
    children,
}) => (
    <div>
        <label htmlFor={id} className="block text-gray-700 font-medium mb-1 text-sm">
            {label}
        </label>
        {children ? (
             <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none shadow-sm transition duration-150 ease-in-out bg-white/90 backdrop-blur"
            >
                {children}
            </select>
        ) : (
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none shadow-sm placeholder:text-slate-400 transition duration-150 ease-in-out bg-white/90 backdrop-blur"
            />
        )}
    </div>
);


// ----------------------------------------------------------------------
// Componente Modal Principal
// ----------------------------------------------------------------------

export default function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    roleName: "estudiante", // Rol por defecto (ajustado)
  });
  const [loading, setLoading] = useState(false);

  // Reiniciar el formulario
  const resetForm = useCallback(() => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      roleName: "estudiante",
    });
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { first_name, last_name, email, password, roleName } = form;

    if (!first_name || !last_name || !email || !password || !roleName) {
      
      Swal.fire("Atención", "Todos los campos son obligatorios", "warning");
      setLoading(false);
      return;
    }
    
    // Validar contraseña
    if (password.length < 6) {
        
        Swal.fire("Advertencia", "La contraseña debe tener al menos 6 caracteres.", "warning");
        setLoading(false);
        return;
    }

    try {
      // 1. OBTENER TOKEN DE AUTENTICACIÓN
      const token = localStorage.getItem("token");
      if (!token) {
        
        Swal.fire("Sesión Expirada", "Tu sesión ha caducado. Inicia sesión de nuevo para registrar usuarios.", "error");
        setLoading(false);
        return;
      }

      // 2. REALIZAR PETICIÓN CON EL HEADER DE AUTORIZACIÓN
      await axios.post( 
        "http://localhost:4000/api/auth/register",
        {
          first_name,
          last_name,
          email,
          password,
          roleName,
        },
        { // Configuración de Axios para incluir el token
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Añadimos el token aquí
          },
        }
      );

      onUserAdded(); 
      handleClose(); 
      
      Swal.fire("¡Éxito!", `Usuario "${email}" registrado con éxito.`, "success");

    } catch (error) {
      console.error("Error al registrar usuario:", error);
      let message = "No se pudo registrar el usuario. Inténtalo de nuevo.";
      if (axios.isAxiosError(error) && error.response) {
        // Si el servidor devuelve 401/403, mostramos un mensaje específico de permisos
        if (error.response.status === 401 || error.response.status === 403) {
            message = "No tienes permisos de administrador (401/403) para registrar nuevos usuarios.";
        } else {
            message = error.response.data.message || error.response.statusText || message;
        }
      }
      
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Estilo Institución Modal
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-fadeIn scale-100 border border-slate-100">
        
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition p-1 rounded-full hover:bg-gray-100"
          aria-label="Cerrar modal"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-sky-100 rounded-full">
            <UserPlus className="w-6 h-6 text-sky-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Registrar Nuevo Usuario
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="first_name"
                    label="Nombre(s)"
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                />
                <InputField
                    id="last_name"
                    label="Apellido(s)"
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <InputField
                id="email"
                label="Correo Electrónico"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
            />
            
            <InputField
                id="password"
                label="Contraseña (Mínimo 6 caracteres)"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
            />

            <InputField
                id="roleName"
                label="Rol del Usuario"
                type="select"
                name="roleName"
                value={form.roleName}
                onChange={handleChange}
                required
            >
                {/* Mapeamos los roles */}
                {availableRoles.map(role => (
                    <option key={role} value={role} className="capitalize">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                ))}
            </InputField>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 transition shadow-md shadow-sky-200 disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 min-w-[150px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
