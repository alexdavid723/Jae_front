import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    Users,
    X,
    User,
    Book,
    Clipboard,
    Calendar,
    Building2,

    ListChecks,
    Settings,
} from "lucide-react";
// Asegúrate de que estas rutas de imágenes son correctas en tu proyecto
import insignia from "@images/insignia.png";
import entrada from "@images/entrada.png";

type Opcion = {
    titulo: string;
    descripcion: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    ruta: string;
    roles: string[];
};

// 🚨 1. Tipo para la Institución (basado en la respuesta del login)
interface InstitutionInfo {
    name: string;
    id: number;
    // Añade otros campos si los usas
}

// 🚨 2. Actualizamos el tipo del estado 'user'
interface UserState {
    first_name?: string;
    last_name?: string;
    role?: string;
    assignedInstitution?: InstitutionInfo; // Incluimos la IE asignada
}


export default function MenuPrincipalPage() {
    const navigate = useNavigate();
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<UserState | null>(null); // Usamos el nuevo UserState

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUser(parsed);
                // Usar toLowerCase() para asegurar que el rol coincida con las claves del array
                setUserRole(parsed.role?.toLowerCase() || null);
            } catch {
                console.error("Error parsing user from localStorage");
                setUser(null);
            }
        }
    }, []);

    const opcionesBase: Opcion[] = [
        // SUPERADMIN
        {
            titulo: "Gestión de Instituciones",
            descripcion: "Crear y administrar instituciones educativas.",
            icon: Building2,
            ruta: "/superadmin/institutions",
            roles: ["superadmin"],
        },
        {
            titulo: "Gestión de Administradores",
            descripcion: "Asignar administradores a cada institución.",
            icon: Users,
            ruta: "/superadmin/admins",
            roles: ["superadmin"],
        },

        // 🔑 ADMIN (Director) - MENÚS ACTUALIZADOS
        {
            // 🚨 RUTA CORREGIDA: Apunta a la sub-ruta de configuración general
            titulo: "Configuración Académica",
            descripcion: "Definir periodos, planes de estudio y facultades.",
            icon: Settings,
            ruta: "/admin/academic-setup", 
            roles: ["admin"],
        },
        
        {
            titulo: "Gestión de Personal",
            descripcion: "Registrar Docentes y Estudiantes.",
            icon: Users,
            ruta: "/admin/personnel-management",
            roles: ["admin"],
        },
        {
            titulo: "Asignación Docente",
            descripcion: "Vincular cursos a profesores por período.",
            icon: ListChecks,
            ruta: "/admin/course-assignment",
            roles: ["admin"],
        },
        {
            titulo: "Matrícula y Admisión",
            descripcion: "Crear procesos de admisión y supervisar matrículas.",
            icon: Clipboard,
            ruta: "/admin/enrollment-process",
            roles: ["admin"],
        },
        

        // DOCENTE
        {
            titulo: "Mis Clases",
            descripcion: "Revisa y gestiona tus clases asignadas.",
            icon: Book,
            ruta: "/teacher/classes",
            roles: ["docente"],
        },
        {
            titulo: "Evaluaciones",
            descripcion: "Gestiona exámenes, notas y retroalimentación.",
            icon: GraduationCap, 
            ruta: "/teacher/evaluations",
            roles: ["docente"],
        },
        {
            titulo: "Calendario Docente",
            descripcion: "Consulta tus horarios y actividades académicas.",
            icon: Calendar,
            ruta: "/teacher/calendar",
            roles: ["docente"],
        },

        // ESTUDIANTE
        {
            titulo: "Mis Cursos",
            descripcion: "Accede a tus cursos y contenidos educativos.",
            icon: Book,
            ruta: "/student/courses",
            roles: ["estudiante"],
        },
        {
            titulo: "Calendario Académico",
            descripcion: "Consulta tus fechas y actividades importantes.",
            icon: Calendar,
            ruta: "/student/calendar",
            roles: ["estudiante"],
        },
    ];

    // 🔹 Filtramos las opciones por rol
    const opciones = userRole ? opcionesBase.filter(op => op.roles.includes(userRole)) : [];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const portalTitle =
        userRole === "superadmin"
            ? "Portal del Superadministrador"
            : userRole === "admin"
                ? "Portal del Director"
                : userRole === "docente"
                    ? "Portal del Docente"
                    : userRole === "estudiante"
                        ? "Portal del Estudiante"
                        : "Portal del Usuario";

    // 🚨 3. Extraer el nombre de la IE
    const institutionName = user?.assignedInstitution?.name;


    return (
        <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${entrada})` }}>
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Botón toggle sidebar */}
            <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-md border border-white/30 transition"
            >
                {sidebarVisible ? <X className="w-5 h-5" /> : <User className="w-5 h-5" />}
                <span className="hidden sm:inline">{sidebarVisible ? "Cerrar" : "Usuario"}</span>
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
                        {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Usuario"}
                    </p>
                    {/* 🚨 4. Mostramos el nombre de la IE debajo del rol, solo si es admin y existe la IE */}
                    {institutionName && userRole === 'admin' && (
                        <p className="text-sm text-sky-200 font-medium mt-1">
                            {institutionName}
                        </p>
                    )}
                    <p className="text-sm text-gray-300 capitalize">
                        {user?.role || "Sin rol"}
                    </p>
                </div>

                <div className="mt-6 w-full border-t border-white/20"></div>

                <div className="mt-6 flex-1 w-full space-y-4">
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/20">
                        Perfil y Configuración
                    </button>
                    <button
                        className="w-full py-2 bg-red-500/70 hover:bg-red-500 rounded-lg transition text-white shadow-md"
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </button>
                </div>

                <div className="mt-auto text-xs text-gray-300">© 2025 CETPRO</div>
            </div>

            {/* Contenido principal */}
            <div
                className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-white transition-all duration-300 ${
                    sidebarVisible && "lg:pr-72"
                }`}
            >
                <h1 className="text-3xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg">{portalTitle}</h1>

                <div className="grid gap-6 w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {opciones.map((op, idx) => {
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
