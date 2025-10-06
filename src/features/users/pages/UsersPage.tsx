import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.15),_transparent_70%)] pointer-events-none" />

      {/* Contenedor principal */}
      <div className="relative w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-2xl p-12 text-center animate-fadeIn">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full shadow-inner">
            <Users className="w-20 h-20 text-sky-600" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-sky-800 mb-4 tracking-wide drop-shadow-sm">
          Gestión de Usuarios
        </h1>

        {/* Descripción */}
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed text-lg">
          Este módulo permite administrar todos los{" "}
          <span className="text-sky-600 font-semibold">usuarios del sistema</span>, 
          gestionando sus <span className="text-sky-600 font-semibold">roles</span> 
          y <span className="text-sky-600 font-semibold">permisos</span> de acceso 
          de manera centralizada y segura.
        </p>

        {/* Línea decorativa */}
        <div className="mt-10 w-40 h-[2px] bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full shadow-lg" />

        {/* Nota final */}
        <p className="mt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} JAE SIS
        </p>
      </div>
    </div>
  );
}
