import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "../layout/sidebar/Sidebar"; // Asegúrate de que el path es correcto
import { Outlet } from "react-router-dom";
import clsx from "clsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Detectar cambios de tamaño
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden pt-16 relative">
        {/* Overlay para móviles */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {/* Se usa sidebarOpen para controlar si se renderiza, no solo la visibilidad */}
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

        {/* Contenido principal */}
        <main
          className={clsx(
            "overflow-y-auto bg-slate-50 p-4 z-0 transition-all duration-300 flex-1"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}