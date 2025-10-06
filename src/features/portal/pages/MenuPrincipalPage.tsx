import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Users,
  X,
  User,
  Book,
  Clipboard,
  Calendar,
} from "lucide-react";
import insignia from "@images/insignia.png";
import entrada from "@images/entrada.png";

// Tipado de las opciones del menú
type Opcion = {
  titulo: string;
  descripcion: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // <- Aquí está el tipado correcto
  ruta: string;
  roles: string[];
};

export default function MenuPrincipalPage() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Obtener usuario desde localStorage
  const [user, setUser] = useState<{
    first_name?: string;
    last_name?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setUserRole(parsed.role);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
        setUser(null);
      }
    }
  }, []);

  // Opciones de menú con roles específicos
  const opcionesBase: Opcion[] = [
    // Administrador / Superadmin
    {
      titulo: "Gestión Institucional",
      descripcion: "Planes, módulos y asignaciones.",
      icon: GraduationCap,
      ruta: "/institutional/plan",
      roles: ["administrador", "superadmin"],
    },
    {
      titulo: "Catálogos",
      descripcion: "Especialidades, docentes y más.",
      icon: BookOpen,
      ruta: "/catalogs/specialties",
      roles: ["administrador", "superadmin"],
    },
    {
      titulo: "Usuarios",
      descripcion: "Gestión de estudiantes y personal.",
      icon: Users,
      ruta: "/users",
      roles: ["administrador", "superadmin"],
    },
    {
      titulo: "Reportes",
      descripcion: "Ver reportes de actividad y estadísticas.",
      icon: Clipboard,
      ruta: "/reports",
      roles: ["administrador", "superadmin"],
    },
    // Estudiante
    {
      titulo: "Mis Cursos",
      descripcion: "Accede a tus asignaturas y contenidos.",
      icon: Book,
      ruta: "/student/courses",
      roles: ["estudiante"],
    },
    {
      titulo: "Calendario Académico",
      descripcion: "Revisa tus fechas importantes.",
      icon: Calendar,
      ruta: "/student/calendar",
      roles: ["estudiante"],
    },
    // Docente
    {
      titulo: "Mis Clases",
      descripcion: "Revisa tus clases asignadas.",
      icon: Book,
      ruta: "/teacher/classes",
      roles: ["docente"],
    },
    {
      titulo: "Evaluaciones",
      descripcion: "Gestiona exámenes y calificaciones.",
      icon: Clipboard,
      ruta: "/teacher/evaluations",
      roles: ["docente"],
    },
    {
      titulo: "Calendario Docente",
      descripcion: "Organiza tus horarios y clases.",
      icon: Calendar,
      ruta: "/teacher/calendar",
      roles: ["docente"],
    },
  ];

  // Filtrar opciones según rol
  const opciones = opcionesBase.filter(
    (op) => userRole && op.roles.includes(userRole)
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${entrada})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Botón toggle sidebar */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-md border border-white/30 transition"
      >
        {sidebarVisible ? (
          <X className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">
          {sidebarVisible ? "Cerrar" : "Usuario"}
        </span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-20 flex flex-col items-center bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl text-white px-6 py-8 transform transition-transform duration-300 ${
          sidebarVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <img
          src={insignia}
          alt="Insignia usuario"
          className="w-20 h-20 rounded-full object-contain bg-white/80 p-2 shadow-lg"
        />
        <div className="mt-4 text-center">
          <p className="font-semibold text-lg">
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : "Usuario"}
          </p>
          <p className="text-sm text-gray-300">{user?.role || "Rol"}</p>
        </div>

        <div className="mt-6 w-full border-t border-white/20"></div>

        <div className="mt-6 flex-1 w-full space-y-4">
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/20">
            Configuración
          </button>
          <button
            className="w-full py-2 bg-red-500/70 hover:bg-red-500 rounded-lg transition text-white shadow-md"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-auto text-xs text-gray-300">© 2025</div>
      </div>

      {/* Contenido principal */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-white transition-all duration-300 ${
          sidebarVisible && "lg:pr-72"
        }`}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg">
          {userRole === "administrador" || userRole === "superadmin"
            ? "Portal del Administrador"
            : userRole === "estudiante"
            ? "Portal del Estudiante"
            : userRole === "docente"
            ? "Portal del Docente"
            : "Portal"}
        </h1>

        <div className="grid gap-6 w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((op: Opcion, idx: number) => {
            const Icon = op.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(op.ruta)}
                className="bg-white/10 hover:bg-white/20 p-6 rounded-xl shadow-lg text-left transition-all backdrop-blur-md border border-white/20"
              >
                <Icon className="w-10 h-10 mb-4 text-sky-300" />
                <h2 className="text-xl font-semibold">{op.titulo}</h2>
                <p className="text-sm text-gray-200">{op.descripcion}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
