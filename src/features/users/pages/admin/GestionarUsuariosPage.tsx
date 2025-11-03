import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import AgregarUsuarioModal from "./AgregarUsuarioModal";
import EditarUsuarioModal from "./EditarUsuarioModal";

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  correo: string;
}

export default function GestionarUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 6;

  // Modal de edición
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

  // Obtener ID del usuario actual desde el token
  let currentUserId: number | null = null;
  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    currentUserId = payload.userId;
  }

  // 🔹 Obtener usuarios desde backend
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data: Usuario[] = await res.json();
      setUsuarios(data);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 🔹 Filtrado
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol.toLowerCase().includes(busqueda.toLowerCase())) &&
      (filtroRol ? u.rol.toLowerCase() === filtroRol.toLowerCase() : true)
  );

  // 🔹 Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const indiceInicial = (paginaActual - 1) * usuariosPorPagina;
  const usuariosVisibles = usuariosFiltrados.slice(
    indiceInicial,
    indiceInicial + usuariosPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 🔹 Eliminar usuario
  const eliminarUsuario = async (id: number) => {
    if (id === currentUserId) {
      Swal.fire("Error", "No puedes eliminar tu propio usuario.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:4000/api/auth/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "No se pudo eliminar el usuario");
        }

        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
      } catch{
        Swal.fire("Error");
      }
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroRol("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f3f7fb] via-[#e6eff7] to-[#f3f7fb]">
        <p className="text-slate-600 text-lg animate-pulse">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f7fb] via-[#e6eff7] to-[#f3f7fb] text-slate-800 px-4 py-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
        {/* 🔹 Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-slate-700">
            Gestión de Usuarios
          </h1>

          <AgregarUsuarioModal
            onUsuarioAgregado={(nuevoUsuario) =>
              setUsuarios((prev) => [nuevoUsuario, ...prev])
            }
          />
        </div>

        {/* 🔹 Filtros y búsqueda */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-sm bg-white/80 text-sm sm:text-base"
            />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 bg-white/80 focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm sm:text-base"
            >
              <option value="">Todos los roles</option>
              <option value="administrador">administrador</option>
              <option value="docente">docente</option>
              <option value="estudiante">estudiante</option>
            </select>
            {(busqueda || filtroRol) && (
              <button
                onClick={limpiarFiltros}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          <div className="flex items-center text-slate-600 text-sm mt-2 sm:mt-0">
            <Filter className="w-4 h-4 mr-2 text-sky-600" />
            {usuariosFiltrados.length} usuarios encontrados
          </div>
        </div>

        {/* 🔹 Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-md bg-white/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-100 text-sky-700 uppercase text-sm">
                <th className="p-4 font-semibold">Nombres y apellidos</th>
                
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosVisibles.length > 0 ? (
                usuariosVisibles.map((u, index) => (
                  <tr
                    key={u.id}
                    className={`transition ${
                      index % 2 === 0 ? "bg-white/70" : "bg-white/50"
                    } hover:bg-sky-50`}
                  >
                    <td className="p-4 text-slate-700">{u.nombre}</td>
                    <td className="p-4 text-slate-600">{u.correo}</td>
                    <td className="p-4 text-slate-700">{u.rol}</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => setUsuarioEditar(u)}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition shadow-sm hover:shadow-blue-300"
                        title="Editar usuario"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarUsuario(u.id)}
                        disabled={u.id === currentUserId}
                        className={`p-2 rounded-lg transition ${
                          u.id === currentUserId
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500/80 hover:bg-red-600 text-white"
                        }`}
                        title={
                          u.id === currentUserId
                            ? "No puedes eliminar tu propio usuario"
                            : "Eliminar usuario"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-slate-500 italic"
                  >
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 sm:mt-8">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-700 font-medium">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal de edición */}
        {usuarioEditar && (
          <EditarUsuarioModal
            usuario={usuarioEditar}
            onClose={() => setUsuarioEditar(null)}
            onUsuarioActualizado={(actualizado) => {
              setUsuarios((prev) =>
                prev.map((u) => (u.id === actualizado.id ? actualizado : u))
              );
              setUsuarioEditar(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
