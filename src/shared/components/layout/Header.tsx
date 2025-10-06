import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    first_name?: string;
    last_name?: string;
    role?: string;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ✅ Obtener usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (err) {
        console.error("Error al obtener usuario del localStorage", err);
        setUser(null);
      }
    }
  }, []);

  // ✅ Obtener iniciales
  const getInitials = () => {
    if (!user?.first_name && !user?.last_name) return "U";
    const firstInitial = user?.first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user?.last_name?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial;
  };

  // ✅ Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Botón y logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-slate-100 transition-colors"
          title="Abrir / Cerrar menú"
        >
          ☰
        </button>
        <img
          src="/logo.png" // Cambia por la ruta real de tu logo
          alt="Logo Institución"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Avatar con iniciales y menú */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-sky-600 text-white font-semibold flex items-center justify-center hover:ring-2 hover:ring-sky-300 transition-all"
          title="Menú de usuario"
        >
          {getInitials()}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
            {/* Nombre y rol del usuario */}
            <div className="px-4 py-2 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-800">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : "Usuario"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role || "Rol"}
              </p>
            </div>

            {/* Opciones */}
            <button
              onClick={() => navigate("/perfil")}
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Perfil
            </button>
            <button
              onClick={() => navigate("/configuracion")}
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Configuración
            </button>
            <hr className="my-1 border-slate-200" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
