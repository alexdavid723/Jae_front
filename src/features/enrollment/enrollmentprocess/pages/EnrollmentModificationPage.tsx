import { Edit } from 'lucide-react';

export default function EnrollmentModificationPage() {
  
  // En esta página se implementará un flujo para buscar la matrícula
  // y permitir al usuario realizar cambios específicos.

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Rectificación y Modificación de Matrícula</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center">
        <Edit className="w-12 h-12 text-sky-500 mx-auto mb-4"/>
        <p className="text-lg font-semibold text-slate-700 mb-4">Busque la Matrícula a Modificar</p>
        
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Ingrese DNI o Cód. de Matrícula" 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
          >
            Buscar
          </button>
        </div>

        <p className="mt-6 text-slate-500 text-sm">
          Una vez encontrada, podrá proceder con rectificación de cursos, retiro temporal o cambio de programa.
        </p>
      </div>

    </div>
  );
}
