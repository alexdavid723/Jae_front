import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* Título */}
      

      {/* Avatar y menú */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 hover:ring-2 hover:ring-sky-300 transition-all"
          title="Menú de usuario"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80"
            alt="Usuario"
            className="w-full h-full object-cover"
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Perfil
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Configuración
            </a>
            <hr className="my-1 border-slate-200" />
            <button
              onClick={() => alert("Sesión cerrada")}
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
