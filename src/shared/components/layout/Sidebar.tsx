import { useState, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  School,
  ClipboardList,
  Clipboard,
  Home,
  ChevronDown,
  Users,

} from "lucide-react";

interface Section {
  name: string;
  icon: React.ElementType;
  items: { name: string; path: string }[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Aquí decides qué mostrar según la ruta actual
  const sections: Section[] = useMemo(() => {
    if (location.pathname.startsWith("/usuarios")) {
      return [
        {
          name: "Gestión de Usuarios",
          icon: Users,
          items: [
            { name: "Administrar Usuarios (docentes y alumnos)", path: "/usuarios/gestionarusuarios" },
            { name: "Lista de usuarios", path: "/usuarios/lista" },
          ],
        },
      ];
    }

    if (location.pathname.startsWith("/institutional")) {
      return [
        {
          name: "Gestión Institucional",
          icon: School,
          items: [
            { name: "Registrar plan", path: "/institutional/plan" },
            { name: "Registrar módulos", path: "/institutional/modules" },
            { name: "Asignaciones", path: "/institutional/assignments" },
          ],
        },
      ];
    }

    if (location.pathname.startsWith("/enrollment")) {
      return [
        {
          name: "Matrícula",
          icon: Clipboard,
          items: [
            { name: "Proceso de Admisión", path: "/enrollment/admission" },
            { name: "Registro de Matrícula", path: "/enrollment/register" },
            { name: "Consulta de Matrículas", path: "/enrollment/list" },
            { name: "Rectificación de Matrícula", path: "/enrollment/modification" },
          ],
        },
      ];
    }

    // 🔸 Por defecto (u otra ruta)
    return [
      {
        name: "Catálogos",
        icon: ClipboardList,
        items: [
          { name: "Especialidades", path: "/catalogs/specialties" },
          { name: "Docentes", path: "/catalogs/teachers" },
        ],
      },
    ];
  }, [location.pathname]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <aside
      className={clsx(
        "backdrop-blur-xl bg-white/60 border-r border-slate-200 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col h-[calc(100vh-64px)] z-40",
        "fixed top-16 left-0 w-72 lg:w-64 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-5 space-y-3 overflow-y-auto flex-1">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const isOpenSection = openSections.includes(idx);

          return (
            <div
              key={idx}
              className="bg-white/70 hover:bg-white/90 border border-slate-200/60 rounded-xl shadow-sm transition-all duration-300"
            >
              <button
                onClick={() => toggleSection(idx)}
                className="flex w-full items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:text-sky-700 transition"
              >
                <span className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-sky-500" />
                  <span>{section.name}</span>
                </span>
                <ChevronDown
                  className={clsx(
                    "w-5 h-5 text-slate-500 transition-transform duration-300",
                    isOpenSection && "rotate-180 text-sky-500"
                  )}
                />
              </button>

              <ul
                className={clsx(
                  "overflow-hidden transition-all duration-500 ease-in-out",
                  isOpenSection ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      onClick={() => window.innerWidth < 1024 && onClose()}
                      className={({ isActive }) =>
                        clsx(
                          "block px-10 py-2 text-sm rounded-md transition-all duration-300",
                          isActive
                            ? "bg-sky-100 text-sky-700 font-semibold shadow-sm"
                            : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* 🌟 Botón elegante para regresar al menú principal */}
      {location.pathname !== "/menu-principal" && (
        <div className="p-5 border-t border-slate-200 bg-white/70 backdrop-blur-md">
          <button
            onClick={() => navigate("/menu-principal")}
            className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
              bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md
              hover:from-sky-600 hover:to-blue-700 transition-all duration-300 ease-out
              hover:scale-[1.03] active:scale-[0.97]"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span>Volver al menú principal</span>
          </button>
        </div>
      )}
    </aside>
  );
}
