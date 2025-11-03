import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, School, BookOpen, ClipboardList, Activity } from "lucide-react";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Interfaces de Datos RAW de la API (Solución al error 'Unexpected any')
// ----------------------------------------------------------------------

interface ApiUser {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  creado_en?: string; // Campo tal como viene de la API
}

interface ApiInstitution {
  id: number;
  name: string;
  code: string;
  status: boolean; // Usado para el conteo de activas
}

// ----------------------------------------------------------------------
// Interfaces de Datos Mapeados y Componentes
// ----------------------------------------------------------------------

interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  fechaCreacion?: string; // Campo formateado para la vista
}

interface Institution {
  id: number;
  name: string;
  code: string;
  status: boolean;
}

interface ResumenItem {
  id: number;
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color: string;
  iconColor: string;
  isLoading: boolean; // Añadido para mostrar estado de carga en la tarjeta
}

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

export default function AdminPage() {
  // ⭐️ ESTADOS DINÁMICOS
  const [, setAllUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]); // Lista de usuarios filtrada (admin y superadmin)
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true); // ⭐️ ESTADOS DE TABLA DE USUARIOS
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Calcula instituciones activas
  const activeInstitutionCount = useMemo(() => {
    return institutions.filter((inst) => inst.status).length;
  }, [institutions]); // ✅ FUNCIÓN PARA OBTENER USUARIOS

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener usuarios"); // Tipado estricto para evitar 'Unexpected any'

      const data: ApiUser[] = await response.json();

      const mappedUsers: User[] = Array.isArray(data)
        ? data.map((u: ApiUser) => ({
            // Uso de ApiUser para tipar el iterador
            id: u.id,
            nombre: u.nombre,
            correo: u.correo,
            rol: u.rol || "Sin rol",
            fechaCreacion: u.creado_en
              ? new Date(u.creado_en).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "No disponible",
          }))
        : [];
      setAllUsers(mappedUsers); // Guardar todos para el conteo total

      // APLICAR FILTRO: Solo 'admin' y 'superadmin'
      const filteredUsers = mappedUsers.filter(
        (u) => u.rol === "admin" || u.rol === "superadmin"
      );
      setAdminUsers(filteredUsers); // Guardar solo los usuarios de administración
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos de usuarios",
        "error"
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []); // ✅ FUNCIÓN PARA OBTENER INSTITUCIONES (Sin cambios)

  const fetchInstitutions = useCallback(async () => {
    setLoadingInstitutions(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/institutions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener instituciones"); // Tipado estricto para la respuesta de la API de instituciones

      const result: { message: string; data: ApiInstitution[] } =
        await response.json();
      const data = Array.isArray(result.data) ? result.data : [];
      setInstitutions(data);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos de instituciones",
        "error"
      );
    } finally {
      setLoadingInstitutions(false);
    }
  }, []); // 🚀 EFECTO PARA CARGAR DATOS

  useEffect(() => {
    fetchUsers();
    fetchInstitutions();
  }, [fetchUsers, fetchInstitutions]); // ✅ CÁLCULO DE TARJETAS DE RESUMEN

  const resumen: ResumenItem[] = useMemo(() => {
    const baseResumen = [
      // 🛑 CAMBIO AQUÍ: Usamos adminUsers.length para contar solo administradores
      {
        id: 1,
        titulo: "Usuarios Administradores", // 💡 Titulo cambiado para reflejar el filtro
        icono: <Users className="w-6 h-6" />,
        color: "from-blue-100 to-blue-50",
        iconColor: "text-blue-500",
        valor: adminUsers.length, // 👈 Se usa la lista filtrada
        isLoading: loadingUsers,
      },
      {
        id: 2,
        titulo: "Instituciones activas",
        icono: <School className="w-6 h-6" />,
        color: "from-green-100 to-green-50",
        iconColor: "text-green-500",
        valor: activeInstitutionCount,
        isLoading: loadingInstitutions,
      },
      {
        id: 3,
        titulo: "Programas técnicos",
        icono: <BookOpen className="w-6 h-6" />,
        color: "from-purple-100 to-purple-50",
        iconColor: "text-purple-500",
        valor: 24,
        isLoading: false,
      }, // Dato estático
      {
        id: 4,
        titulo: "Reportes pendientes",
        icono: <ClipboardList className="w-6 h-6" />,
        color: "from-red-100 to-red-50",
        iconColor: "text-red-500",
        valor: 3,
        isLoading: false,
      }, // Dato estático
    ];

    return baseResumen.map((item) => ({
      ...item, // Asegura que el tipo final coincida con ResumenItem
      valor: item.valor as string | number,
    }));
  }, [
    adminUsers.length,
    activeInstitutionCount,
    loadingUsers,
    loadingInstitutions,
  ]); // 👈 Dependencia actualizada // ✅ LÓGICA DE PAGINACIÓN (Usuarios) // USAMOS adminUsers para el cálculo de paginación y la lista visible

  const totalPages = Math.ceil(adminUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = adminUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f7fb] via-[#e6eff7] to-[#f3f7fb] text-slate-800 px-4 py-6 flex justify-center">
      {" "}
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
        {" "}
        <div className="mb-8 flex items-center gap-3 border-b pb-4 border-slate-100">
          <Activity className="w-7 h-7 text-sky-600" />{" "}
          <div>
            {" "}
            <h1 className="text-3xl font-semibold text-slate-700">
              Panel de Administración
            </h1>
            <p className="text-slate-500 mt-1">
              Resumen de métricas clave y gestión de usuarios del sistema
              CETPRO.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        {/* 🔹 Tarjetas de resumen (Ahora la primera cuenta solo Admins) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {" "}
          {resumen.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl shadow-lg bg-gradient-to-br ${item.color} border border-gray-200 hover:shadow-xl transition`}
            >
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="text-sm font-medium text-slate-600">
                    {item.titulo}
                  </h2>
                  <p className="text-3xl font-bold text-slate-800 mt-1">
                    {" "}
                    {item.isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      item.valor
                    )}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl shadow-md ${item.iconColor} bg-white/70`}
                >
                  {item.icono}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Lista de Administradores ({adminUsers.length})
          </h2>
          {loadingUsers ? (
            <p className="text-center text-slate-500 italic py-6">
              Cargando usuarios...
            </p>
          ) : currentUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm sm:text-base">
                  <thead>
                    <tr className="bg-sky-100 text-sky-700 uppercase text-xs">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold min-w-[150px]">
                        Nombre
                      </th>
             
                      <th className="p-3 font-semibold min-w-[180px]">
                        Correo
                      </th>
            
                      <th className="p-3 font-semibold">Rol</th>
                  
                      <th className="p-3 font-semibold min-w-[200px]">
                        Creación
                      </th>
                    
                    </tr>
                  
                  </thead>
        
                  <tbody>
     
                    {currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`transition ${
                          index % 2 === 0 ? "bg-white/70" : "bg-white/50"
                        } hover:bg-sky-50`}
                      >
           
                        <td className="p-3 text-slate-700">{user.id}</td>
        
                        <td className="p-3 text-slate-700">{user.nombre}</td>
                  
                        <td className="p-3 text-slate-600">{user.correo}</td>
          
                        <td className="p-3">
             
                          <span
                            className={`capitalize px-3 py-1 text-xs rounded-full font-medium ${
                              // Estilos solo para admin y superadmin
                              user.rol === "superadmin"
                                ? "bg-red-500 text-white"
                                : user.rol === "admin"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-300 text-slate-600" // Caso por defecto (aunque no debería salir)
                            }`}
                          >
                            {user.rol}
                       
                          </span>
         
                        </td>

                        <td className="p-3 text-slate-500 text-xs">
                          {user.fechaCreacion}
                        </td>
                   
                      </tr>
                    ))}
        
                  </tbody>
       
                </table>
        
              </div>
              
   
              <div className="flex justify-center mt-6">
         
                <div className="flex items-center gap-2">
            
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      currentPage === 1
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-sky-600 text-white hover:bg-sky-700"
                    } transition`}
                  >
                   ← Anterior 
                  
                  </button>
              
                  <span className="text-slate-600 font-medium text-sm">
                    Página {currentPage}{" "}
                    de {totalPages}
                  </span>
             
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      currentPage === totalPages
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-sky-600 text-white hover:bg-sky-700"
                    } transition`}
                  >
                    Siguiente → 
                  </button>
                  
                </div>
                
              </div>
              
            </>
          ) : (
            <p className="text-center text-slate-500 italic py-6">
               No se encontraron usuarios con rol
              Admin o Superadmin. 
            </p>
          )}
          
        </div>
      
      </div>
     
    </div>
  );
}
