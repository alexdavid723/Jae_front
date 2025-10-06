import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Users, UserCheck, Clock, UserX, Search, FileDown, Eye, CheckCircle, UserMinus } from 'lucide-react';

// --- Tipos y Datos de Ejemplo ---

// Define la estructura de un postulante
type ApplicantStatus = 'Admitido' | 'Pendiente' | 'Rechazado';

interface Applicant {
  id: string;
  fullName: string;
  dni: string;
  program: string;
  applicationDate: string;
  status: ApplicantStatus;
}

// Datos de ejemplo (reemplazar con datos de tu API)
const MOCK_APPLICANTS: Applicant[] = [
  { id: '1', fullName: 'Ana Lucía Torres Vega', dni: '78945612', program: 'Desarrollo de Sistemas', applicationDate: '2025-09-28', status: 'Admitido' },
  { id: '2', fullName: 'Carlos Alberto Quispe Mamani', dni: '71234567', program: 'Contabilidad', applicationDate: '2025-09-27', status: 'Pendiente' },
  { id: '3', fullName: 'Sofía Elena Mendoza Rojas', dni: '75689123', program: 'Enfermería Técnica', applicationDate: '2025-09-27', status: 'Pendiente' },
  { id: '4', fullName: 'Javier Alonso Paredes Flores', dni: '74125896', program: 'Desarrollo de Sistemas', applicationDate: '2025-09-26', status: 'Rechazado' },
  { id: '5', fullName: 'Gabriela Vargas Luna', dni: '79852147', program: 'Contabilidad', applicationDate: '2025-09-25', status: 'Admitido' },
  { id: '6', fullName: 'Miguel Ángel Rivas Soto', dni: '73579024', program: 'Marketing Digital', applicationDate: '2025-09-25', status: 'Pendiente' },
  { id: '7', fullName: 'Laura Cristina Huanca Dávila', dni: '70123456', program: 'Contabilidad', applicationDate: '2025-09-24', status: 'Rechazado' },
];

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: number;
    colorClass: string;
}

// --- Componente Principal ---

export default function AdmissionProcessPage() {
  const navigate = useNavigate();
  // Se añade setApplicants para poder modificar el estado local de los datos
  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Lógica para filtrar los postulantes
  const filteredApplicants = useMemo(() => {
    return applicants
      .filter(applicant => {
        if (statusFilter === 'Todos') return true;
        return applicant.status === statusFilter;
      })
      .filter(applicant => 
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.dni.includes(searchTerm)
      );
  }, [applicants, searchTerm, statusFilter]);

  // Cálculos para las tarjetas de estadísticas
  const stats = useMemo(() => ({
    total: applicants.length,
    admitted: applicants.filter(a => a.status === 'Admitido').length,
    pending: applicants.filter(a => a.status === 'Pendiente').length,
    rejected: applicants.filter(a => a.status === 'Rechazado').length,
  }), [applicants]);

  // --- Funcionalidad de Botones ---

  // 1. Exportar CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Nombre Completo", "DNI", "Programa", "Fecha Postulación", "Estado"];
    
    // Mapea los postulantes filtrados al formato de fila CSV
    const csvRows = filteredApplicants.map(applicant => [
      applicant.id,
      `"${applicant.fullName}"`, // Encierra el nombre entre comillas por si tiene comas
      applicant.dni,
      `"${applicant.program}"`,
      applicant.applicationDate,
      applicant.status
    ].join(','));

    // Combina encabezados y filas
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // Crea un Blob y un enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "postulantes_filtrados.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("El navegador no soporta la descarga directa de archivos.");
    }
    
    console.log(`Exportando ${filteredApplicants.length} postulantes a CSV.`);
  }, [filteredApplicants]);

  // 2. Navegar a Registro
  const handleNavigateToRegister = useCallback(() => {
    // Usamos el path configurado en AppRouter.tsx: 'enrollment/register'
    navigate('/enrollment/register');
    console.log('Navegando a la página de Registro de Matrícula.');
  }, [navigate]);

  // 3. Ver Detalles (placeholder)
  const handleViewDetails = useCallback((applicantId: string) => {
    // Integración Backend: Aquí se debe navegar a una vista de detalle o abrir un modal
    // para cargar y mostrar toda la información del postulante.
    console.log(`Acción: Ver detalles del postulante con ID: ${applicantId}`);
    // Ejemplo de navegación: navigate(`/enrollment/admission/${applicantId}`);
  }, []);

  // 4. Admitir Postulante
  const handleAdmitApplicant = useCallback(async (applicantId: string) => {
    // ⚠️ INTEGRACIÓN BACKEND CLAVE: 
    // Llamada a la API para actualizar el estado en el servidor.
    
    console.log(`Simulación: Intentando admitir al postulante con ID: ${applicantId}`);

    // SIMULACIÓN DE ÉXITO (Reemplazar con lógica de backend real)
    setApplicants(prev => 
        prev.map(a => a.id === applicantId ? { ...a, status: 'Admitido' } : a)
    );
    // Mostrar notificación: 'Postulante admitido con éxito'.
    
  }, []);

  // 5. Rechazar Postulante (NUEVO)
  const handleRejectApplicant = useCallback(async (applicantId: string) => {
    // ⚠️ INTEGRACIÓN BACKEND CLAVE: 
    // Llamada a la API para actualizar el estado en el servidor.

    console.log(`Simulación: Intentando rechazar al postulante con ID: ${applicantId}`);

    // SIMULACIÓN DE ÉXITO (Reemplazar con lógica de backend real)
    setApplicants(prev => 
        prev.map(a => a.id === applicantId ? { ...a, status: 'Rechazado' } : a)
    );
    // Mostrar notificación: 'Postulante rechazado con éxito'.

  }, []);


  // --- Sub-Componentes (JSX) ---

  // Componente de Tarjeta de Estadística
  const StatCard = ({ icon: Icon, title, value, colorClass }: StatCardProps) => (
    <div className={`bg-white p-4 rounded-xl shadow-lg border-l-4 ${colorClass} transition duration-300 hover:shadow-xl`}>
      <div className="flex items-center">
        <div className="p-3 bg-slate-100 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );

  // Función para obtener el 'Badge' de estado
  const getStatusBadge = (status: ApplicantStatus) => {
    const styles = {
      Admitido: 'bg-green-100 text-green-800 border-green-300',
      Pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Rechazado: 'bg-red-100 text-red-800 border-red-300',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    // Contenedor principal con estilo Tailwind
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* 1. Encabezado y Acciones Principales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 md:mb-0">Gestión de Postulantes</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-100 transition duration-150 ease-in-out">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV ({filteredApplicants.length})
          </button>
          <button 
            onClick={handleNavigateToRegister}
            className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition duration-150 ease-in-out hover:shadow-lg">
            + Registrar Nuevo
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} title="Total Postulantes" value={stats.total} colorClass="border-sky-500" />
        <StatCard icon={UserCheck} title="Admitidos" value={stats.admitted} colorClass="border-green-500" />
        <StatCard icon={Clock} title="Pendientes" value={stats.pending} colorClass="border-yellow-500" />
        <StatCard icon={UserX} title="Rechazados" value={stats.rejected} colorClass="border-red-500" />
      </div>
      
      {/* 3. Filtros y Búsqueda */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition focus:outline-none"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option>Todos</option>
              <option>Admitido</option>
              <option>Pendiente</option>
              <option>Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabla de Postulantes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-100 text-xs text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4">Nombre Completo</th>
                <th scope="col" className="px-6 py-4">DNI</th>
                <th scope="col" className="px-6 py-4">Programa</th>
                <th scope="col" className="px-6 py-4">Fecha Postulación</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition duration-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{applicant.fullName}</td>
                  <td className="px-6 py-4">{applicant.dni}</td>
                  <td className="px-6 py-4">{applicant.program}</td>
                  <td className="px-6 py-4 text-slate-500">{applicant.applicationDate}</td>
                  <td className="px-6 py-4">{getStatusBadge(applicant.status)}</td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button 
                      onClick={() => handleViewDetails(applicant.id)}
                      className="font-medium text-sky-600 hover:text-sky-800 transition duration-150 flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> Detalles
                    </button>

                    {/* Botón Admitir (visible si NO está Admitido) */}
                    {applicant.status !== 'Admitido' && (
                      <button 
                        onClick={() => handleAdmitApplicant(applicant.id)}
                        className="font-medium text-green-600 hover:text-green-800 transition duration-150 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Admitir
                      </button>
                    )}

                    {/* Botón Rechazar (visible si NO está Rechazado) */}
                    {applicant.status !== 'Rechazado' && (
                      <button 
                        onClick={() => handleRejectApplicant(applicant.id)}
                        className="font-medium text-red-600 hover:text-red-800 transition duration-150 flex items-center">
                        <UserMinus className="w-4 h-4 mr-1" /> Rechazar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                 <tr className="bg-white">
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                        No se encontraron postulantes que coincidan con los filtros.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
