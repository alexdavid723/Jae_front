import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { X, User, Mail, Briefcase, Save, Loader2 } from "lucide-react";

// Nota: Esta interfaz debe coincidir con la data que pasas desde GestionarUsuariosPage
interface UsuarioData {
  id: number;
  nombre: string; // Contiene el nombre completo
  correo: string;
  rol: string;
}

interface EditarUsuarioModalProps {
  usuario: UsuarioData;
  onClose: () => void;
  onUsuarioActualizado: (usuario: UsuarioData) => void;
}

export default function EditarUsuarioModal({
  usuario,
  onClose,
  onUsuarioActualizado,
}: EditarUsuarioModalProps) {
  // CORRECCIÓN 1: Usamos un solo estado para el nombre completo
  const [fullName, setFullName] = useState(usuario.nombre || "");
  const [email, setEmail] = useState(usuario.correo);
  
  const rol = usuario.rol; 
  const [loading, setLoading] = useState(false);

  const actualizarUsuario = useCallback(async () => {
    if (!fullName || !email) {
      Swal.fire("Error", "El nombre completo y el correo son obligatorios.", "warning");
      return;
    }

    // CORRECCIÓN 2: Lógica para dividir el campo único en nombre y apellido para el backend
    const nameParts = fullName.trim().split(/\s+/);
    const firstNameToSend = nameParts[0] || "";
    // Asume que todo lo demás es el apellido (puede ser vacío si solo se ingresó un nombre)
    const lastNameToSend = nameParts.slice(1).join(" ") || ""; 

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Simulación de latencia para mejor UX (opcional)
      await new Promise(resolve => setTimeout(resolve, 300)); 

      const res = await fetch(`http://localhost:4000/api/auth/users/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Enviamos los datos separados tal como el backend espera
          first_name: firstNameToSend,
          last_name: lastNameToSend,
          email,
          roleName: rol, // Enviamos el rol sin cambios
        }),
      });

      if (!res.ok) {
        // Manejo de errores de la API
        const errorData = await res.json().catch(() => ({ message: "Error desconocido del servidor" }));
        throw new Error(errorData.message || "Fallo al actualizar el usuario en el servidor");
      }

      const responseData = await res.json();
      const updatedUser = responseData.user;

      // Devolvemos el objeto actualizado con el nombre completo
      onUsuarioActualizado({
        id: updatedUser.id,
        nombre: updatedUser.nombre, // Mapeamos el nombre completo devuelto
        correo: updatedUser.correo, 
        rol: updatedUser.rol,       
      });

      Swal.fire("Éxito", "Los datos del usuario han sido actualizados.", "success");
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      let errorMessage = "No se pudo actualizar el usuario. Verifique la conexión o el servidor.";
        if (error instanceof Error) {
         errorMessage = error.message;
      }
      
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [fullName, email, rol, usuario.id, onClose, onUsuarioActualizado]); // Dependencias actualizadas

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Contenedor principal del Modal */}
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-2xl transform transition-all duration-300 scale-100">
        
        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Título y Subtítulo */}
        <div className="text-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-sky-500" /> Editar Miembro
          </h2>
          <p className="text-sm text-gray-500 mt-1">Modificando los datos de **{usuario.nombre}**.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => { e.preventDefault(); actualizarUsuario(); }} className="flex flex-col gap-5">
          
          {/* Sección de Datos Personales */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2 border-l-4 border-sky-400 pl-2">Información Personal</h3>
            <div className="flex flex-col gap-3">
              
              {/* CORRECCIÓN 3: Campo único para el Nombre Completo */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre Completo"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm transition"
                />
              </div>

              {/* Campo de Correo Electrónico */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Electrónico"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm transition"
                />
              </div>
            </div>
          </div>
          
          {/* Sección de Rol (No Editable) */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2 border-l-4 border-sky-400 pl-2">Permisos del Sistema</h3>
            <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2 border border-gray-300 shadow-inner">
              <Briefcase className="w-5 h-5 text-sky-500 mr-3" />
              <div className="flex-grow">
                  <span className="text-sm text-gray-500 block">Rol Actual:</span>
                  <span className="font-medium text-gray-800 capitalize">{rol}</span>
              </div>
              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">NO EDITABLE</span>
            </div>
          </div>


          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ease-in-out shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transform hover:scale-[1.01]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando Cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Actualización</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}