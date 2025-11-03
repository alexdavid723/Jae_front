import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckSquare, Save, Loader2, AlertTriangle, User, ArrowLeft, Calendar, Clock } from 'lucide-react';

// ==========================================================
// ⚙️ FUNCIÓN DE AUTENTICACIÓN
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================
// Datos del estudiante y su nota
interface StudentGrade {
    grade_id: number; // ID de la tabla 'Grade'
    student_id: number;
    student_name: string;
    grade: number | null;
    observation: string | null;
}

// Datos de la clase (Asignación)
interface AssignmentDetails {
    course_name: string;
    period_name: string;
    shift: string;
    students: StudentGrade[];
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/teacher'; 

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function TeacherEvaluationsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const assignmentId = searchParams.get('assignmentId'); // ID de la Asignación

    const [assignmentInfo, setAssignmentInfo] = useState<Omit<AssignmentDetails, 'students'>>();
    const [students, setStudents] = useState<StudentGrade[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Estudiantes y Notas (READ)
    // ------------------------------------------------------------------
    const fetchClassDetails = useCallback(async () => {
        if (!assignmentId) {
            setError("No se proporcionó un ID de asignación.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Llama al nuevo endpoint del backend
            const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/grades`, { 
                headers: getAuthHeaders() 
            }); 

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar los datos de la clase.');
            }

            const data: AssignmentDetails = await response.json();
            
            // Guardamos los datos de la clase por separado
            setAssignmentInfo({
                course_name: data.course_name,
                period_name: data.period_name,
                shift: data.shift
            });
            // Guardamos la lista de estudiantes
            setStudents(data.students);
           
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Class Details Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchClassDetails();
    }, [fetchClassDetails]);

    // ------------------------------------------------------------------
    // 🔄 Manejadores de Formulario
    // ------------------------------------------------------------------
    
    // Actualiza la nota en el estado local (frontend)
    const handleGradeChange = (student_id: number, newGrade: string) => {
        setStudents(prevStudents => 
            prevStudents.map(student => {
                if (student.student_id === student_id) {
                    // Convertir a número, asegurando que esté entre 0 y 20
                    let gradeVal = parseInt(newGrade);
                    if (isNaN(gradeVal) || newGrade === '') gradeVal = 0; // O null si prefieres
                    if (gradeVal > 20) gradeVal = 20;
                    if (gradeVal < 0) gradeVal = 0;
                    
                    return { ...student, grade: gradeVal };
                }
                return student;
            })
        );
    };

    // Actualiza la observación en el estado local (frontend)
    const handleObservationChange = (student_id: number, observation: string) => {
         setStudents(prevStudents => 
            prevStudents.map(student => 
                student.student_id === student_id ? { ...student, observation: observation } : student
            )
        );
    };

    // ------------------------------------------------------------------
    // 💾 Guardar Notas (UPDATE)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Preparamos solo los datos que el backend necesita actualizar
            const gradesToUpdate = students.map(s => ({
                grade_id: s.grade_id,
                grade: s.grade,
                observation: s.observation
            }));

            const response = await fetch(`${API_BASE_URL}/update-grades`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    assignmentId: Number(assignmentId),
                    grades: gradesToUpdate
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al guardar las notas.');
            }
            
            setSuccess("¡Notas guardadas exitosamente!");
            // Opcional: recargar los datos
            // fetchClassDetails(); 

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Save Grades Error:', err);
            setError(err.message || 'Error de conexión.');
        } finally {
            setIsSaving(false);
        }
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (UI)
    // ------------------------------------------------------------------
    return (
        <div className="space-y-8 p-4 md:p-6 bg-slate-50 min-h-full">
            
            {/* ... Encabezado ... */}
            <header className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <CheckSquare className="w-7 h-7 mr-3 text-sky-600" />
                    Registro de Evaluaciones
                </h1>
                <button
                    onClick={() => navigate('/teacher/classes')}
                    className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition duration-150"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver a Mis Clases
                </button>
            </header>

            {/* Mensaje de Error de Carga */}
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
                    Cargando lista de estudiantes...
                </div>
            )}

            {/* Contenido (Formulario y Tabla) */}
            {!loading && !error && assignmentInfo && (
                <form onSubmit={handleSubmit}>
                    {/* Información del Curso Asignado */}
                    <div className="mb-6 p-5 bg-white rounded-xl shadow-lg border border-slate-200">
                        <h2 className="text-xl font-bold text-indigo-700 mb-3 truncate">{assignmentInfo.course_name}</h2>
                        <div className="flex flex-col sm:flex-row justify-between text-sm text-slate-600 space-y-2 sm:space-y-0">
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                {assignmentInfo.period_name}
                            </span>
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                Turno: <strong className="ml-1">{assignmentInfo.shift}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Estudiantes y Notas */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                                        Nota (0-20)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                        Observación
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            Aún no hay estudiantes inscritos en esta clase.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.student_id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                <User className="w-4 h-4 mr-2 inline text-slate-400" />
                                                {s.student_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    value={s.grade ?? ''}
                                                    onChange={(e) => handleGradeChange(s.student_id, e.target.value)}
                                                    className="w-24 rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border text-center font-bold"
                                                    disabled={isSaving}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm hidden md:table-cell">
                                                <input
                                                    type="text"
                                                    value={s.observation ?? ''}
                                                    onChange={(e) => handleObservationChange(s.student_id, e.target.value)}
                                                    className="w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border"
                                                    placeholder="Opcional..."
                                                    disabled={isSaving}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mensaje de Error de Guardado */}
                    {success && (
                        <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                            {success}
                        </div>
                    )}
                    
                    {/* Botón de Guardar */}
                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || isSaving || students.length === 0}
                            className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-indigo-700 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Guardando Notas..." : "Guardar Notas"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
