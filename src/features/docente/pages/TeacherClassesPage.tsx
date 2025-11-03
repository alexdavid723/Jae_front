import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Calendar, Users, AlertTriangle, Loader2, Library, CheckSquare } from 'lucide-react';
// (Asumimos que tienes una utilidad compartida para getAuthHeaders, si no, la definimos aquí)

// ==========================================================
// ⚙️ FUNCIÓN DE AUTENTICACIÓN (Definida localmente)
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});


// ==========================================================
// 🎯 Tipos de Datos (Basados en teacherController.js)
// ==========================================================
interface TeacherAssignment {
    id: number; // ID de la Asignación (Assignment)
    shift: string; // Mañana, Tarde, Noche
    course_name: string;
    course_code: string;
    program_name: string;
    period_name: string;
    student_count: number; // Conteo de estudiantes (Grades)
}

// Tipo para agrupar las asignaciones por periodo
interface GroupedAssignments {
    [period_name: string]: TeacherAssignment[];
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
// Este endpoint debe existir en tu backend (teacherRoutes.js)
const API_URL = 'http://localhost:4000/api/teacher/my-assignments'; 

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function TeacherClassesPage() {
    const navigate = useNavigate();
    const [groupedAssignments, setGroupedAssignments] = useState<GroupedAssignments>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Asignaciones (READ)
    // ------------------------------------------------------------------
    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() }); 

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar las asignaciones.');
            }

            const data: TeacherAssignment[] = await response.json();
            
            // Agrupar por Periodo Académico
            const grouped = data.reduce((acc, assignment) => {
                const period = assignment.period_name;
                if (!acc[period]) {
                    acc[period] = [];
                }
                acc[period].push(assignment);
                return acc;
            }, {} as GroupedAssignments);

            setGroupedAssignments(grouped);
           
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Assignments Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setGroupedAssignments({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // ------------------------------------------------------------------
    // 🎨 Navegación (Ir a la página de notas)
    // ------------------------------------------------------------------
    const handleManageClass = (assignmentId: number) => {
        // Navega a la página de Evaluaciones (definida en tu router.tsx)
        navigate(`/teacher/evaluations?assignmentId=${assignmentId}`);
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (UI)
    // ------------------------------------------------------------------
    const periodKeys = Object.keys(groupedAssignments);

    return (
        <div className="space-y-8 p-4 md:p-6 bg-slate-50 min-h-full">
            {/* ... Encabezado ... */}
            <header className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <BookOpen className="w-7 h-7 mr-3 text-sky-600" />
                    Mis Clases Asignadas
                </h1>
            </header>

            {/* Mensaje de Error */}
            {error && (
                <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Error: {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-10 text-slate-500 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Cargando asignaciones...
                </div>
            )}

            {/* Contenido (Agrupado por Periodo) */}
            {!loading && !error && (
                <>
                    {periodKeys.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-slate-600">No tienes clases asignadas</h2>
                            <p className="mt-1 text-slate-500">Contacta al Director (Admin) para que te asigne cursos en el periodo actual.</p>
                        </div>
                    ) : (
                        periodKeys.map((periodName) => (
                            <section key={periodName} className="mb-12">
                                <h2 className="text-2xl font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-300 flex items-center">
                                    <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
                                    {periodName}
                                </h2>
                                
                                {/* Grid de Tarjetas de Curso */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedAssignments[periodName].map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
                                        >
                                            {/* Encabezado de la Tarjeta (Curso y Turno) */}
                                            <div className="p-5 bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{item.course_code}</span>
                                                    <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" /> {item.shift}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold truncate" title={item.course_name}>{item.course_name}</h3>
                                                <p className="text-sm text-sky-100 flex items-center mt-1 opacity-90">
                                                    <Library className="w-4 h-4 mr-1.5" />
                                                    {item.program_name}
                                                </p>
                                            </div>
                                            
                                            {/* Cuerpo de la Tarjeta (Estudiantes y Botón) */}
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex-grow flex justify-between items-center text-sm text-slate-600 mb-5">
                                                    <span className="font-medium">Estudiantes:</span>
                                                    <span className="font-bold text-3xl text-indigo-600 flex items-center">
                                                        <Users className="w-5 h-5 mr-2" />
                                                        {item.student_count}
                                                    </span>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleManageClass(item.id)}
                                                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                                                >
                                                    <CheckSquare className="w-4 h-4 mr-2" />
                                                    Gestionar Clase (Notas)
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </>
            )}
        </div>
    );
}

