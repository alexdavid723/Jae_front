/* eslint-disable no-irregular-whitespace */
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Users,
  Building2,
  ListPlus,
  ServerOff,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios"; 

// Asegúrate de que este componente AddUserModal exista
import AddUserModal from "./AddUserModal"; 

// ----------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------

interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  status: boolean;
}

interface AssignedAdmin {
  id: number; // ID del registro pivote (InstitutionAdmin ID)
  user_id: number; // ID del usuario real
  institution_id: number;
  assigned_at: string;
  user: {
    id: number; // ID del usuario real
    first_name: string;
    last_name: string;
    email: string;
    role: string; 
  };
  institution: Institution;
}

interface UnassignedAdmin {
    id: number; // user_id
    first_name: string;
    last_name: string;
    email: string;
    role: string; 
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

export default function AdministrarAdminsPage() {
  const [assignedAdmins, setAssignedAdmins] = useState<AssignedAdmin[]>([]);
  const [unassignedAdmins, setUnassignedAdmins] = useState<UnassignedAdmin[]>([]); 
  const [activeInstitutions, setActiveInstitutions] = useState<Institution[]>([]); 
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true); 
  const [loadingUnassigned, setLoadingUnassigned] = useState(true); 
  const [unassignedError, setUnassignedError] = useState(false); 
  
  const usersPerPage = 5;
  const AUTH_API_URL = "http://localhost:4000/api/auth/users"; // URL base para eliminar usuarios

  // 1. OBTENER INSTITUCIONES ACTIVAS
  const fetchActiveInstitutions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/institutions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const active = response.data.data.filter((inst: Institution) => inst.status === true);
      setActiveInstitutions(active || []);
    } catch (error) {
      console.error("Error al obtener instituciones:", error);
      Swal.fire("Error", "No se pudieron cargar las instituciones activas", "error");
    }
  }, []);

  // 2. OBTENER ADMINS ASIGNADOS A INSTITUCIONES
  const fetchAssignedAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/institution-admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedAdmins(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener admins asignados:", error);
      Swal.fire("Error", "No se pudieron cargar los administradores asignados", "error");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  // 3. OBTENER ADMINS SIN ASIGNAR
  const fetchUnassignedAdmins = useCallback(async () => {
    setLoadingUnassigned(true);
    setUnassignedError(false);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/institution-admins/users/unassigned-admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnassignedAdmins(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener admins sin asignar:", error);
      setUnassignedError(true);
    } finally {
      setLoadingUnassigned(false);
    }
  }, []);
  
  useEffect(() => {
    fetchActiveInstitutions();
    fetchAssignedAdmins();
    fetchUnassignedAdmins();
  }, [fetchActiveInstitutions, fetchAssignedAdmins, fetchUnassignedAdmins]);

  const handleUserAdded = () => {
    fetchAssignedAdmins(); 
    fetchUnassignedAdmins();
  };

  // FUNCIÓN CLAVE: ELIMINAR USUARIO POR COMPLETO
  const handleDeleteUser = (userId: number, userName: string) => {
    Swal.fire({
      title: '¡Eliminar Usuario!',
      text: `¿Estás seguro de ELIMINAR al administrador ${userName} (${userId}) del sistema? Esta acción es irreversible.`,
      icon: 'error', 
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar Permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626', 
      cancelButtonColor: '#3085d6', 
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          
          await axios.delete(`${AUTH_API_URL}/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          fetchAssignedAdmins();
          fetchUnassignedAdmins(); 

          Swal.fire(
            'Eliminado',
            `${userName} ha sido eliminado permanentemente del sistema.`,
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
          const msg = axios.isAxiosError(error) && error.response 
            ? error.response.data.message || 'Error al conectar con el servidor.' 
            : 'Error desconocido al eliminar el usuario.';

          Swal.fire("Error", msg, "error");
        }
      }
    });
  };
  
  // Desasignar Administrador (Eliminar relación InstitutionAdmin)
  const handleUnassignAdmin = (assignmentId: number, adminName: string, institutionName: string) => {
    Swal.fire({
      title: '¿Desasignar administrador?',
      text: `¿Estás seguro de desasignar a ${adminName} de la institución ${institutionName}? Esto no elimina su cuenta.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Desasignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          
          await axios.delete(`http://localhost:4000/api/institution-admins/unassign/${assignmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchAssignedAdmins();
          fetchUnassignedAdmins(); 
          Swal.fire('Desasignado', `${adminName} ha sido desasignado de ${institutionName}.`, 'success');
        } catch (error) {
          console.error("Error al desasignar administrador:", error);
          const msg = axios.isAxiosError(error) && error.response 
            ? error.response.data.message || 'Error al conectar con el servidor.' 
            : 'Error desconocido al desasignar.';
          Swal.fire("Error", msg, "error");
        }
      }
    });
  };

  // Asignar Institución
  const handleAssignInstitution = async (adminId: number) => {
    if (activeInstitutions.length === 0) {
        Swal.fire("Atención", "No hay instituciones activas disponibles para asignar.", "warning");
        return;
    }

    const options = activeInstitutions.reduce((acc, inst) => {
      acc[inst.id] = `${inst.name} (${inst.code})`; 
      return acc;
    }, {} as Record<number, string>);

    
    const { value: institutionId } = await Swal.fire({
      title: 'Seleccionar Institución',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Seleccione una institución',
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0284c7',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve(undefined); 
          } else {
            resolve('Debes seleccionar una institución');
          }
        });
      }
    });

    if (institutionId) {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:4000/api/institution-admins/assign", {
              user_id: adminId,
              institution_id: parseInt(institutionId),
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            fetchAssignedAdmins();
            fetchUnassignedAdmins();
            Swal.fire("¡Éxito!", "Institución asignada correctamente al administrador.", "success");
            
        } catch (error) {
            console.error("Error al asignar institución:", error);
            const msg = axios.isAxiosError(error) && error.response 
                ? error.response.data.message || 'Error al conectar con el servidor.' 
                : 'Error desconocido al asignar institución.';
            Swal.fire("Error", msg, "error");
        }
    }
  };
  
  // Filtro de búsqueda
  const filteredUsers = assignedAdmins.filter(
    (u) =>
      `${u.user.first_name} ${u.user.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.user.email.toLowerCase().includes(search.toLowerCase()) ||
      u.institution.name.toLowerCase().includes(search.toLowerCase()) ||
      u.institution.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const visibleUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearSearch = () => setSearch("");

  // Modal para mostrar la institución
  const showInstitutionModal = (institution: Institution) => {
    
    Swal.fire({
      title: `<strong>${institution.name}</strong>`,
      html: `
        <div class="text-left text-slate-700">
          <p><b>Código:</b> ${institution.code}</p>
          <p><b>ID:</b> ${institution.id}</p>
          <p><b>Dirección:</b> ${institution.address || 'N/A'}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#0284c7",
      background: "#f8fafc",
      backdrop: `rgba(0,0,0,0.4) left top no-repeat`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f7fb] via-[#e6eff7] to-[#f3f7fb] text-slate-800 px-4 py-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-slate-700 flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-600" />
            Gestión de Administradores
          </h1>
          
          {/* Botón que abre el modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold transition shadow-md shadow-sky-200"
          >
            + Agregar administrador
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* SECCIÓN: ADMINISTRADORES SIN INSTITUCIÓN */}
        {/* ----------------------------------------------------------- */}
        {(unassignedAdmins.length > 0 || loadingUnassigned || unassignedError) && (
            <div className="mb-10 p-5 border border-amber-200 bg-amber-50/70 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2 mb-4">
                    <ServerOff className="w-5 h-5" />
                    Admins pendientes de Asignación ({unassignedAdmins.length})
                </h2>
                
                {loadingUnassigned ? (
                    <div className="p-4 text-center text-amber-600 italic">Cargando administradores sin institución...</div>
                ) : unassignedError ? ( 
                    <div className="p-4 text-center text-red-600 font-medium bg-red-100 rounded-lg flex items-center justify-center gap-2">
                        <X className="w-5 h-5"/> No se pudieron cargar los administradores sin institución. Por favor, revisa la conexión con la API.
                    </div>
                ) : unassignedAdmins.length === 0 ? ( 
                    <div className="p-4 text-center text-green-600 font-medium bg-green-100 rounded-lg">
                        ✅ No hay administradores pendientes de asignación.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-amber-100 text-amber-700 uppercase text-xs">
                                    <th className="p-3 font-semibold">Nombre</th>
                                    <th className="p-3 font-semibold">Correo</th>
                                    <th className="p-3 font-semibold">Institución</th>
                                    <th className="p-3 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unassignedAdmins.map((admin, index) => (
                                    <tr
                                        key={admin.id}
                                        className={`transition ${
                                            index % 2 === 0 ? "bg-white/70" : "bg-white/50"
                                        } hover:bg-amber-50`}
                                    >
                                        <td className="p-3">
                                            {admin.first_name} {admin.last_name}
                                        </td>
                                        <td className="p-3">{admin.email}</td>
                                        <td className="p-3 capitalize font-medium text-amber-600">
                                            <button 
                                                onClick={() => handleAssignInstitution(admin.id)}
                                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition text-sm shadow-sm disabled:opacity-50"
                                                disabled={activeInstitutions.length === 0}
                                            >
                                                <ListPlus className="w-4 h-4" />
                                                {activeInstitutions.length === 0 ? 'No hay inst. activas' : 'Asignar Institución'}
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            {/* Botón Eliminar Usuario para Admins Sin Asignar */}
                                            <button
                                                onClick={() => 
                                                    handleDeleteUser(admin.id, `${admin.first_name} ${admin.last_name}`)
                                                }
                                                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                                                title={`Eliminar usuario ${admin.last_name}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
        
        {/* ----------------------------------------------------------- */}
        {/* SECCIÓN: ADMINS ASIGNADOS A INSTITUCIONES */}
        {/* ----------------------------------------------------------- */}

        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 mb-4 mt-8">
            <Building2 className="w-5 h-5" />
            Admins Asignados a Instituciones
        </h2>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o institución..."
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
            {filteredUsers.length} administradores encontrados
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-md bg-white/60 backdrop-blur-md">
            {loadingAdmins ? (
                <div className="p-6 text-center text-slate-500 italic">Cargando administradores...</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-sky-100 text-sky-700 uppercase text-sm">
                            <th className="p-4 font-semibold">#</th>
                            <th className="p-4 font-semibold">Nombre completo</th>
                            <th className="p-4 font-semibold">Correo</th>
                            <th className="p-4 font-semibold">Institución</th>
                            <th className="p-4 font-semibold">Código</th>
                            <th className="p-4 font-semibold text-center">Acciones</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {visibleUsers.length > 0 ? (
                            visibleUsers.map((u, index) => (
                                <tr
                                    key={u.id}
                                    className={`transition ${
                                        index % 2 === 0 ? "bg-white/70" : "bg-white/50"
                                    } hover:bg-sky-50`}
                                >
                                    <td className="p-4">{u.id}</td>
                                    <td className="p-4">
                                        {u.user.first_name} {u.user.last_name}
                                    </td>
                                    <td className="p-4">{u.user.email}</td>
                                    <td
                                        className="p-4 text-sky-600 hover:text-sky-800 cursor-pointer font-medium flex items-center gap-2"
                                        onClick={() => showInstitutionModal(u.institution)}
                                    >
                                        <Building2 className="w-4 h-4" />
                                        {u.institution.name}
                                    </td>
                                    <td className="p-4">{u.institution.code}</td>
                                    <td className="p-4 flex gap-2 justify-center">
                                        {/* Botón Desasignar (Quitar relación) */}
                                        <button
                                            onClick={() => 
                                                handleUnassignAdmin(
                                                    u.id, 
                                                    `${u.user.first_name} ${u.user.last_name}`, 
                                                    u.institution.name
                                                )
                                            }
                                            className="p-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition shadow-md"
                                            title={`Desasignar a ${u.user.last_name} de su institución`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Botón ELIMINAR USUARIO (Cuenta Completa) */}
                                        <button
                                            onClick={() => 
                                                handleDeleteUser(u.user_id, `${u.user.first_name} ${u.user.last_name}`)
                                            }
                                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                                            title={`Eliminar usuario ${u.user.last_name}`}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                                    No se encontraron administradores.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
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
      </div>
      
      {/* Renderización del Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}