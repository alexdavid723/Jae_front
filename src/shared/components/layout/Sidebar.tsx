import { useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
// 1. Importar el nuevo ícono
import { School, ClipboardList, Clipboard } from "lucide-react";

interface Section {
  name: string;
  icon: React.ElementType;
  items: { name: string; path: string }[];
}

const sections: Section[] = [
  {
    name: "Gestión Institucional",
    icon: School,
    items: [
      { name: "Registrar plan", path: "/institutional/plan" },
      { name: "Registrar módulos", path: "/institutional/modules" },
      { name: "Asignaciones", path: "/institutional/assignments" },
    ],
  },
  // 2. Agregar el nuevo menú de Matrícula aquí
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
  {
    name: "Catálogos",
    icon: ClipboardList,
    items: [
      { name: "Especialidades", path: "/catalogs/specialties" },
      { name: "Docentes", path: "/catalogs/teachers" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <aside
      className={clsx(
        "bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 shadow-lg transition-transform duration-300 ease-in-out flex flex-col h-[calc(100vh-64px)] z-40",
        // Mobile overlay
        "fixed top-16 left-0 w-64 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {sections.map((section, idx) => {
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