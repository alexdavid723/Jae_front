import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    // Contenedor principal con fondo sutil
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-6 font-inter">
      
      {/* Tarjeta de Error con estilo premium */}
      <div className="w-full max-w-md bg-white p-12 rounded-3xl text-center 
                    shadow-2xl shadow-red-300/50 border-t-8 border-red-600 
                    transition-all duration-300 transform hover:scale-[1.01]">
        
        {/* Ícono de Error Grande */}
        <div className="flex justify-center mb-6">
          <ShieldOff className="w-16 h-16 text-red-600 border-4 border-red-100 p-3 rounded-full bg-red-50 animate-pulse-slow" />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
          Acceso Denegado
        </h1>
        
        {/* Mensaje */}
        <p className="text-lg text-slate-600 mb-8">
          No tienes los permisos necesarios para acceder a esta sección. 
          Por favor, contacta al administrador si crees que es un error.
        </p>
        
        {/* Botón de Retorno con degradado Indigo/Violeta */}
        <button
          onClick={() => navigate('/menu-principal')}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-3 text-base font-semibold
                     text-white shadow-xl shadow-indigo-500/50 hover:from-indigo-700 hover:to-violet-800 focus:outline-none focus:ring-4
                     focus:ring-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Portal Principal
        </button>
      </div>
    </div>
  );
}
