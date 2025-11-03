import React from 'react';
import { Settings } from 'lucide-react';

// Se asume el path: D:\JAESIS\src\features\admin\pages\GeneralSetupPage.tsx

export default function GeneralSetupPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        <Settings className="inline w-7 h-7 mr-2 text-sky-600" />
        Configuración General de la Institución
      </h1>
      
      <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Parámetros Globales</h3>
        <p className="mt-2 text-slate-600">
          Aquí se gestionarán los ajustes de la institución a nivel superior, como el nombre legal, código, logo, año académico actual y configuraciones por defecto del sistema.
        </p>
        <p className="mt-4 text-sm text-sky-600 font-medium">
          Las opciones de Periodos, Planes y Facultades se encuentran ahora en el menú lateral izquierdo para facilitar la navegación.
        </p>
        
        {/* Aquí irían los formularios para editar parámetros globales */}
      </div>
    </div>
  );
}