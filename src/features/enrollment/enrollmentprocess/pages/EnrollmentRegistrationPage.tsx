import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentRegistrationPage() {
  const navigate = useNavigate();

  // Función placeholder para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ Integración Backend: Aquí iría la lógica para enviar los datos de la matrícula a tu API.
    console.log("Datos de Matrícula enviados al backend.");
    // Después del éxito, puedes navegar de vuelta a la lista de admisión:
    // navigate('/enrollment/admission');
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sky-600 hover:text-sky-800 transition mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a Proceso de Admisión
      </button>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">Registro de Nueva Matrícula</h1>
      
      {/* Contenedor del Formulario */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Datos del Estudiante</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input type="text" id="fullName" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Ej: Ana Lucía Torres Vega" required />
            </div>
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
              <input type="text" id="dni" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Ej: 78945612" required />
            </div>
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-slate-700 mb-1">Programa/Carrera</label>
              <select id="program" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required>
                <option value="">Seleccione una opción</option>
                <option>Desarrollo de Sistemas</option>
                <option>Contabilidad</option>
                <option>Enfermería Técnica</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-slate-700 mb-1">Estado de Pago</label>
              <select id="paymentStatus" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required>
                <option>Pagado</option>
                <option>Pendiente</option>
              </select>
            </div>
          </div>

          <p className="text-xl font-semibold text-slate-700 border-b pb-2 pt-4 mb-4">Información Adicional</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Matrícula</label>
              <input type="date" id="date" defaultValue={new Date().toISOString().substring(0, 10)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
            </div>
            {/* Se pueden añadir campos para ciclo, turno, sede, etc. */}
          </div>
          
          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out hover:shadow-lg"
            >
              Confirmar y Registrar Matrícula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
