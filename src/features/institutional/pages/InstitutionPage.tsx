import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
// Nota: Estos modales deben estar presentes en la ruta indicada.
import AddInstitutionModal from "../modals/AddInstitutionModal";
import EditInstitutionModal from "../modals/EditInstitutionModal"; 

interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
  status: boolean;
}

export default function InstitutionPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const institutionsPerPage = 4;

  // ✅ Traer instituciones desde la API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/institutions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("No se pudieron cargar las instituciones");

        const data = await response.json();
        setInstitutions(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        // Manejo de error de tipo 'unknown'
        console.error(error);
        Swal.fire("Error", "No se pudieron cargar las instituciones", "error");
      }
    };

    fetchInstitutions();
  }, []);

  // ✅ Búsqueda filtrada
  const filteredInstitutions = Array.isArray(institutions)
    ? institutions.filter(
        (inst) =>
          inst.name.toLowerCase().includes(search.toLowerCase()) ||
          inst.code.toLowerCase().includes(search.toLowerCase()) ||
          inst.address.toLowerCase().includes(search.toLowerCase()) ||
          inst.email.toLowerCase().includes(search.toLowerCase()) ||
          inst.phone.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredInstitutions.length / institutionsPerPage);
  const startIndex = (currentPage - 1) * institutionsPerPage;
  const visibleInstitutions = filteredInstitutions.slice(
    startIndex,
    startIndex + institutionsPerPage
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 🚀 Implementación de Eliminar Institución con manejo de errores de relación (CORREGIDO)
  const deleteInstitution = (id: number, name: string) => {
    Swal.fire({
      title: `¿Eliminar institución: ${name}?`,
      text: "Esta acción no se puede deshacer. Se eliminarán datos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 1. Mostrar estado de carga
        Swal.fire({
          title: "Eliminando...",
          text: "Por favor, espera mientras se contacta al servidor.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const token = localStorage.getItem("token");
          
          const response = await fetch(`http://localhost:4000/api/institutions/${id}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
          });
          
          // ⚠️ MANEJO DE ERRORES DE RESPUESTA DE LA API
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar.' }));
            const serverMessage = errorData.message || 'La institucion tiene IE asociada; primero elimine esa relacion en Gestionar Usuarios.';

            // ✅ Verificación específica para errores de relación (Clave Foránea)
            // Asumimos que el backend devuelve un mensaje que contiene estas palabras clave.
            const isRelationError = serverMessage.toLowerCase().includes('relación') || serverMessage.toLowerCase().includes('foreign key') || serverMessage.toLowerCase().includes('asociado');

            if (isRelationError) {
                // ALERTA PERSONALIZADA PARA ERROR DE DEPENDENCIA
                Swal.fire({
                    title: "Error de Dependencia",
                    html: `
                    Esta institución (**${name}**) no puede ser eliminada porque tiene **datos asociados** (ej. administradores, programas).<br><br>Primero debe **eliminar o reasignar** esas relaciones.`,
                    icon: "info",
                    confirmButtonColor: "#3085d6"
                });
                return; // Detiene la ejecución aquí
            }
            
            // Para cualquier otro error (400, 500, etc.) no relacionado con claves foráneas
            throw new Error(serverMessage);
          }

          // 3. Éxito: Actualizar el estado local y mostrar mensaje
          setInstitutions((prev) => prev.filter((i) => i.id !== id));
          
          Swal.fire({
            title: "¡Eliminada!", 
            text: `La institución ${name} ha sido eliminada con éxito.`, 
            icon: "success",
            confirmButtonColor: "#3085d6"
          });

        } catch (error) {
          // Manejo de errores de red o errores genéricos no capturados arriba
          console.error("La institucion tiene IE asociada; primero elimine esa relacion en Gestionar Usuarios:", error);
          
          Swal.fire({
            title: "Erroraaaaaaaaaa", 
            text: "La institucion tiene IE asociada; primero elimine esa relacion en Gestionar Usuarios", 
            icon: "error",
            confirmButtonColor: "#3085d6"
          });
        }
      }
    });
  };

  const clearSearch = () => setSearch("");

  const handleInstitutionAdded = (newInst: Institution) => {
    setInstitutions((prev) => [newInst, ...prev]);
  };

  const handleInstitutionUpdated = (updated: Institution) => {
    setInstitutions((prev) =>
      prev.map((inst) => (inst.id === updated.id ? updated : inst))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f7fb] via-[#e6eff7] to-[#f3f7fb] text-slate-800 px-4 py-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-slate-700 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sky-600" />
            Gestión de Instituciones
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
          >
            + Agregar institución
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por cualquier campo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-sm bg-white/80 text-sm"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition text-sm"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>
          <div className="flex items-center text-slate-600 text-sm mt-2 sm:mt-0">
            <Filter className="w-4 h-4 mr-2 text-sky-600" />
            {filteredInstitutions.length} instituciones encontradas
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-md bg-white/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-100 text-sky-700 uppercase text-sm">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Código</th>
                <th className="p-4 font-semibold">Dirección</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstitutions.length > 0 ? (
                visibleInstitutions.map((inst, index) => (
                  <tr
                    key={inst.id}
                    className={`transition ${
                      index % 2 === 0 ? "bg-white/70" : "bg-white/50"
                    } hover:bg-sky-50`}
                  >
                    <td className="p-4">{inst.name}</td>
                    <td className="p-4">{inst.code}</td>
                    <td className="p-4">{inst.address}</td>
                    <td className="p-4">{inst.email}</td>
                    <td className="p-4">{inst.phone}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        inst.status 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {inst.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedInstitution(inst);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition shadow-sm"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInstitution(inst.id, inst.name)}
                        className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition shadow-sm"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No se encontraron instituciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-700 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modales */}
        <AddInstitutionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onInstitutionAdded={handleInstitutionAdded}
        />

        {isEditModalOpen && selectedInstitution && (
          <EditInstitutionModal
            isOpen={isEditModalOpen}
            institution={selectedInstitution}
            onClose={() => setIsEditModalOpen(false)}
            onInstitutionUpdated={handleInstitutionUpdated}
          />
        )}
      </div>
    </div>
  );
}