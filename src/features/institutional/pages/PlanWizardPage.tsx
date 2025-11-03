import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, LayoutList, Settings } from "lucide-react";

// Definición de ítems para el sidebar de navegación local
const navigationItems = [
  { 
    name: 'Períodos Académicos', 
    icon: Calendar, 
    path: 'periods' 
  },
  { 
    name: 'Planes de Estudio', 
    icon: LayoutList, 
    path: 'plans' 
  },
];

export default function PlanWizardPage() {
  const location = useLocation();
  // Obtiene la ruta base dinámica: /admin/academic-setup
  const baseRoute = location.pathname.split('/').slice(0, 3).join('/');

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      
      {/* Header General del Módulo */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
        <Settings className="w-8 h-8 text-sky-600" />
        <h1 className="text-3xl font-extrabold text-gray-800">
          Configuración Académica
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Navegación Local */}
        <div className="w-full lg:w-72 flex-shrink-0 bg-white shadow-xl rounded-xl p-5 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Gestión Central
          </h2>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                // Construye la ruta completa (ej: /admin/academic-setup/periods)
                to={`${baseRoute}/${item.path}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition duration-150 ease-in-out ${
                  location.pathname.includes(item.path)
                    ? 'bg-sky-500 text-white shadow-md font-bold transform translate-x-1'
                    : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600 font-medium'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-grow bg-white p-6 shadow-xl rounded-xl border border-gray-100 min-h-[70vh]">
          {/* El Outlet renderiza AcademicPeriodPage o StudyPlanPage */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
