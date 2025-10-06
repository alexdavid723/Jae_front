import { useState, useCallback, useMemo } from "react";
import { UserPlus, X, Send, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// --- Interfaces ---
interface NuevoUsuario {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  roleName: string;
}

interface UsuarioAgregado {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

interface ModalEleganteAgregarUsuarioProps {
  onUsuarioAgregado: (usuario: UsuarioAgregado) => void;
}

// --- Animaciones ---
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { y: "-100vh", opacity: 0, scale: 0.5 },
  visible: {
    y: "0",
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { y: "100vh", opacity: 0, scale: 0.5 },
};

// --- Componente ---
export default function ModalEleganteAgregarUsuario({
  onUsuarioAgregado,
}: ModalEleganteAgregarUsuarioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<NuevoUsuario>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    roleName: "docente",
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = useMemo(() => ["administrador", "docente", "estudiante"], []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        roleName: "docente",
      });
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const isFormValid = useMemo(() => {
    return (
      formData.first_name.trim() !== "" &&
      formData.last_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== ""
    );
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      Swal.fire({
        icon: "warning",
        title: "¡Atención!",
        text: "Por favor, complete todos los campos requeridos.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Simular delay opcional
      await new Promise((resolve) => setTimeout(resolve, 500));

      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: "Error desconocido del servidor",
        }));
        throw new Error(errorData.message || "Fallo al registrar el usuario");
      }

      const data = await res.json();

      // 🔹 Aquí usamos data.user para obtener el usuario recién creado
      const nuevoUsuario = {
        id: data.user.id,
        nombre: `${data.user.first_name} ${data.user.last_name}`,
        correo: data.user.email,
        rol: data.user.roleName || formData.roleName,
      };

      onUsuarioAgregado(nuevoUsuario);

      Swal.fire({
        icon: "success",
        title: "¡Registro Exitoso!",
        text: `El usuario '${nuevoUsuario.nombre}' ha sido añadido.`,
        confirmButtonText: "Excelente",
        confirmButtonColor: "#10b981",
      });

      toggleModal();
    } catch (error) {
      let errorMessage = "Ocurrió un error desconocido. Intente nuevamente.";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;

      console.error("Error al registrar el usuario:", error);

      Swal.fire({
        icon: "error",
        title: "Error de Operación",
        text: `No fue posible completar el registro. Detalles: ${errorMessage}`,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón Abrir Modal */}
      <button
        onClick={toggleModal}
        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 px-6 py-3 rounded-full text-white font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Abrir formulario para agregar un nuevo usuario"
      >
        <UserPlus className="w-5 h-5" />
        <span className="hidden sm:inline">Nuevo Miembro</span>
        <span className="sm:hidden">Agregar</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleModal}
          >
            <motion.div
              className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-10 relative overflow-hidden"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={toggleModal}
                className="absolute top-5 right-5 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Encabezado */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-cyan-500 pb-2 inline-block">
                  Registro de Miembro
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete los detalles del nuevo usuario.
                </p>
              </div>

              {/* Formulario */}
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Nombre"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-200 text-gray-700 placeholder-gray-400 transition-shadow"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Apellido"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-200 text-gray-700 placeholder-gray-400 transition-shadow"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-200 text-gray-700 placeholder-gray-400 transition-shadow"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña Provisional"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-200 text-gray-700 placeholder-gray-400 transition-shadow"
                />

                <div className="relative">
                  <select
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleChange}
                    className="appearance-none w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-cyan-200 text-gray-700 bg-white pr-10 transition-shadow"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                    isLoading || !isFormValid
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Confirmar Registro</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
