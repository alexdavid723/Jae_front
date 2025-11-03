import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { 
  School, ClipboardList, Clipboard, 
  Users, BarChart3, Building2, 
  ChevronLeft, Settings,
  UserSquare, ListChecks
} from "lucide-react";

interface Section {
  name: string;
  icon: React.ElementType;
  items: { name: string; path: string }[];
}

// ==========================================================
// 🎯 SECCIONES POR ROLES Y GRUPOS DE RUTAS
// ==========================================================

// ➡️ Admin Académico (Legacy)
const adminAcademicSections: Section[] = [
  {
    name: "Gestión Institucional",
    icon: School,
    items: [
      { name: "Registrar plan", path: "/institutional/plan" },
      { name: "Registrar módulos", path: "/institutional/modules" },
      { name: "Asignaciones", path: "/institutional/assignments" },
    ],
  },
  {
    name: "Matrícula",
    icon: Clipboard,
    items: [

      { name: "Registro de Matrícula", path: "/enrollment/register" },


    ],
  },
  {
    name: "Catálogos",
    icon: ClipboardList,
    items: [
      { name: "Facultades", path: "/catalogos/faculties" }, 
      { name: "Programas", path: "/catalogos/programs" },
      { name: "Cursos", path: "/catalogos/courses" },
    ],
  },
  {
    name: "Reportes",
    icon: BarChart3,
    items: [
      { name: "Ver Reportes", path: "/reports" }, 
    ],
  },
];

// ➡️ Admin Director (Secciones de Nivel Superior)
const adminDirectorSections: Section[] = [
  {
    name: "Configuración Académica", 
    icon: Settings,
    items: [
      { name: "Configuración General", path: "/admin/academic-setup" }, 
      { name: "Periodos Académicos", path: "/admin/academic-setup/periods" },
      { name: "Planes de Estudio", path: "/admin/academic-setup/plans" },
      { name: "Áreas", path: "/admin/academic-setup/faculties" },
      { name: "Programas", path: "/admin/academic-setup/programs" },
      { name: "Cursos/Modulos", path: "/admin/academic-setup/courses" },
    ],
  },
  {
    name: "Gestión de Personal",
    icon: UserSquare,
    items: [
      { name: "Docentes y Estudiantes", path: "/admin/personnel-management" }, 
    ],
  },
  {
    name: "Asignación Docente",
    icon: ListChecks,
    items: [
      { name: "Asignar Cursos", path: "/admin/course-assignment" }, 
    ],
  },
  // 💡 SECCIÓN AÑADIDA: Matrícula
  {
    name: "Matrícula y Admisión",
    icon: Clipboard,
    items: [
      { name: "Ver Procesos", path: "/admin/enrollment-process" }, 
    ],
  },
];

// ➡️ Admin de Usuarios
const adminUsersSections: Section[] = [
  {
    name: "Gestión de Usuarios",
    icon: Users,
    items: [
      { name: "Lista de Usuarios", path: "/usuarios" },
      { name: "Gestionar Usuarios", path: "/usuarios/gestionarusuarios" },
    ],
  },
];

// ➡️ Superadmin: Instituciones
const superadminSectioninstitutional: Section[] = [
  {
    name: "Gestión Institucional",
    icon: Building2,
    items: [
      { name: "Instituciones", path: "/superadmin/institutions" },
    ],
  },
];

// ➡️ Superadmin: Administradores 
const superadminSectiongestionarusuarios: Section[] = [
  {
    name: "Administradores",
    icon: Users,
    items: [
      { name: "Listar Administradores", path: "/superadmin/admins" },
      { name: "Gestionar Administradores", path: "/superadmin/administrarusuarios" },
    ],
  },
];

// 💡 Navegación para Gestión de Personal
const personnelManagementNavigation: Section[] = [
    {
        name: "Personal",
        icon: UserSquare,
        items: [
            { name: "Lista General", path: "/admin/personnel-management" },
        ],
    },
    {
        name: "Volver",
        icon: Settings,
        items: [
             { name: "Menú Principal", path: "/menu-principal" },
        ]
    }
];

// 💡 Navegación: Asignación de Cursos
const courseAssignmentNavigation: Section[] = [
    {
        name: "Asignación de Cursos",
        icon: ListChecks,
        items: [
            { name: "Asignaciones", path: "/admin/course-assignment" },
        ],
    },
    {
        name: "Volver",
        icon: Settings,
        items: [
             { name: "Menú Principal", path: "/menu-principal" },
        ]
    }
];

// 💡==========================================================
// 💡 NUEVA NAVEGACIÓN: Matrícula y Admisión
// 💡==========================================================
const enrollmentNavigation: Section[] = [
    {
        name: "Matrícula y Admisión",
        icon: Clipboard,
        items: [
            // Página principal del módulo
            { name: "Procesos de Admisión", path: "/admin/enrollment-process" }, 
            // Rutas Legacy (que aún están en tu router)
            { name: "Registro de Matrícula", path: "/enrollment/register" },
            { name: "Consulta de Matrículas", path: "/enrollment/list" },


        ],
    },
    {
        name: "Volver",
        icon: Settings,
        items: [
             { name: "Menú Principal", path: "/menu-principal" },
        ]
    }
];


// ==========================================================
// 🎯 Mapeo Principal de rutas a secciones
// ==========================================================
const sectionsMap: { [key: string]: Section[] } = {
  // Mapeos de Sub-módulos (deben ir primero)
  "/admin/personnel-management": personnelManagementNavigation, 
  "/admin/course-assignment": courseAssignmentNavigation, 
  "/admin/enrollment-process": enrollmentNavigation, // 👈 AÑADIDO
  
  // Base Admin Director Sections
  "/admin": adminDirectorSections, 

  // Mantenemos los antiguos (incluyendo /enrollment para que el sub-sidebar funcione)
  "/institutional": adminAcademicSections,
  "/enrollment": enrollmentNavigation, // 👈 AÑADIDO (para las rutas legacy)
  "/catalogos": adminAcademicSections, 
  "/reports": adminAcademicSections, 
  "/usuarios": adminUsersSections,
  
  // Superadmin
  "/superadmin/institutions": superadminSectioninstitutional,
  "/superadmin/admins": superadminSectiongestionarusuarios,
  "/superadmin/administrarusuarios": superadminSectiongestionarusuarios,
};

// ==========================================================
// 🎯 Componente Sidebar
// ==========================================================
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<number[]>([]);

  // Detectar pathRoot: Esta es la clave para mapear las secciones
  const pathParts = location.pathname.split('/').filter(p => p.length > 0);
  let pathRoot = '/';
  
  if (pathParts.length > 0) {
    pathRoot = `/${pathParts[0]}`;
    
    if (pathParts[0] === "superadmin" && pathParts.length >= 2) {
      pathRoot = `/${pathParts[0]}/${pathParts[1]}`;
    }
    
    // 💡 LÓGICA DE DETECCIÓN DE SUB-MÓDULOS
    if (pathParts[0] === "admin" && pathParts[1] === "personnel-management") {
        pathRoot = "/admin/personnel-management";
    } else if (pathParts[0] === "admin" && pathParts[1] === "course-assignment") {
        pathRoot = "/admin/course-assignment";
    } else if (pathParts[0] === "admin" && pathParts[1] === "enrollment-process") { // 👈 AÑADIDO
        pathRoot = "/admin/enrollment-process";
    } else if (pathParts[0] === "enrollment") { // 👈 AÑADIDO (para rutas legacy)
        pathRoot = "/enrollment";
    } else if (pathParts[0] === "admin") {
        pathRoot = "/admin"; // Usa la navegación general del Director
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionsToRender = sectionsMap[pathRoot] || [];

  // Abrir automáticamente la sección activa al cambiar de ruta
  useEffect(() => {
    if (sectionsToRender.length === 0) return; 

    const activeIndex = sectionsToRender.findIndex(section => 
      section.items.some(item => location.pathname.startsWith(item.path))
    );

    if (activeIndex !== -1) {
      setOpenSections([activeIndex]);
    } else {
      setOpenSections([0]); // Abrir la primera por defecto si no hay activa
    }
  }, [pathRoot, location.pathname, sectionsToRender]); // Dependencias limpias


  // Función para abrir/cerrar los submenús
  const toggleSection = (index: number) => {
    setOpenSections((prevOpenSections) => {
        if (prevOpenSections.includes(index)) {
            return prevOpenSections.filter((i) => i !== index);
        } else {
            // Permite solo una sección abierta a la vez
            return [index]; 
        }
    });
  };

  const handleGoBackToMenu = () => {
    navigate("/menu-principal");
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <aside
      className={clsx(
        "bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 shadow-lg transition-transform duration-300 ease-in-out flex flex-col h-[calc(100vh-64px)] z-40",
        "fixed top-16 left-0 w-64 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={handleGoBackToMenu}
          className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Volver al Menú Principal
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {sectionsToRender.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx}>
              <button
                onClick={() => toggleSection(idx)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50"
              >
                <span className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-slate-600" />
                  {section.name}
                </span>
                <svg
                  className={clsx(
                    "w-4 h-4 text-slate-500 transition-transform duration-200",
                    openSections.includes(idx) && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.includes(idx) && (
                <ul className="mt-1 pl-6 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        // 💡 CORREGIDO: Usando isActive de NavLink
                        className={({ isActive }) => 
                          clsx(
                            "block px-3 py-1.5 text-sm rounded-md transition-colors duration-200",
                            isActive
                              ? "bg-sky-100 text-sky-700 font-medium shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-sky-700"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
