import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ClipboardList, User, BookOpen, CheckCircle, XCircle, 
    Trash2, AlertTriangle, Plus, Loader2, MinusCircle, PlusCircle, Edit2,
    Download // 💡 1. Importar ícono de descarga
} from 'lucide-react'; 
import clsx from 'clsx';
// ❌ Esta página ya no usa el modal de modificación

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
interface EnrollmentRecord {
    id: number;
    status: string; 
    enrolled_at: string;
    student_name: string;
    program_name: string;
    admission_process: string; 
    
    student_id: number;
    program_id: number;
    admission_process_id: number;
    academicPeriod: { 
        id: number;
        name: string;
    };
}

interface ConfirmationModalState {
    isOpen: boolean;
    itemId: number | null; 
    itemName: string;
}

interface AssignmentCourse { 
    assignment_id: number;
    course_id: number; 
    course_name: string;
    teacher_name: string;
    shift: string;
}

interface EnrolledCourse { 
    grade_id: number; 
    course_id: number; 
    assignment_id: number; 
    course_name: string;
    teacher_name: string;
    shift: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/enrollments'; 


// ==========================================================
//  💡 2. Helper: Descargar CSV (Función Pura)
// ==========================================================
/**
 * @description Toma un JSON (array de objetos) y lo convierte en un archivo CSV descargable.
 * @param jsonData Los datos de la API (pre-formateados por el backend).
 * @param fileName El nombre del archivo (ej. nomina.csv).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const downloadCSV = (jsonData: any[], fileName: string) => {
    if (!jsonData || jsonData.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Usar las cabeceras de tu plantilla de Excel
    const keys = Object.keys(jsonData[0]);
    const csvHeader = keys.join(',') + '\n';
    
    const csvRows = jsonData.map(row => {
        return keys.map(key => {
            let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
            // Escapar comas y comillas dentro de las celdas
            if (cell.includes(',')) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',');
    }).join('\n');

    // UTF-8 BOM para asegurar que Excel lea tildes y caracteres especiales
    const BOM = '\uFEFF';
    const csvContent = BOM + csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function EnrollmentListPage() {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRecord | null>(null);
    const [availableCourses, setAvailableCourses] = useState<AssignmentCourse[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false); 
    
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Matrículas (READ - Lista Principal)
    // ------------------------------------------------------------------
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() }); 

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar las matrículas.');
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                 setEnrollments(data as EnrollmentRecord[]);
            } else {
                throw new Error("La respuesta del servidor no es un array.");
            }
           
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Enrollments Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Limpia los mensajes de éxito/error
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    // ------------------------------------------------------------------
    // 🗑️ Lógica de Eliminación (Anular Matrícula)
    // ------------------------------------------------------------------
    const handleConfirmDelete = (id: number, name: string) => {
        setConfirmationModal({
            isOpen: true,
            itemId: id,
            itemName: name,
        });
    };

    const handleDelete = async () => {
        const id = confirmationModal.itemId;
        setConfirmationModal({ ...confirmationModal, isOpen: false }); 

        if (!id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al anular la matrícula.');
            }

            fetchItems(); 
            setSelectedEnrollment(null); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    // ------------------------------------------------------------------
    // 💡 LÓGICA: Selección y Carga de Cursos (Detalle)
    // ------------------------------------------------------------------
    
    const fetchEnrolledAndAvailableCourses = useCallback(async (enrollment: EnrollmentRecord) => {
        setLoadingCourses(true);
        setError(null); 
        try {
            const { student_id, academicPeriod, program_id } = enrollment;
            
            if (!academicPeriod || typeof academicPeriod.id === 'undefined' || !student_id) {
                console.error("Datos incompletos en el registro de matrícula:", enrollment);
                throw new Error("Datos de Estudiante o Periodo (academicPeriod) incompletos en esta matrícula. (Asegúrate de que el Backend envíe el objeto 'academicPeriod' en la respuesta de /api/enrollments)");
            }
            
            const periodId = academicPeriod.id; 
            const headers = getAuthHeaders();

            // Cargar Cursos Inscritos (Grades)
            const enrolledRes = await fetch(`${API_BASE_URL}/${student_id}/registered-courses?periodId=${periodId}`, { headers });
            if (!enrolledRes.ok) throw new Error("Error cargando cursos inscritos.");
            setEnrolledCourses(await enrolledRes.json());

            // Cargar Cursos Disponibles (Assignments)
            const availableRes = await fetch(`${API_BASE_URL}/${student_id}/available-courses?periodId=${periodId}&programId=${program_id}`, { headers });
            if (!availableRes.ok) throw new Error("Error cargando cursos disponibles.");
            setAvailableCourses(await availableRes.json());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error cargando listas de cursos:", err);
            setError(err.message || "Error al cargar la lista de cursos.");
        } finally {
            setLoadingCourses(false);
        }
    }, []); 

    const handleRowClick = (enrollment: EnrollmentRecord) => {
        if (selectedEnrollment?.id === enrollment.id) {
            setSelectedEnrollment(null);
            setEnrolledCourses([]);
            setAvailableCourses([]);
        } else {
            setSelectedEnrollment(enrollment);
            fetchEnrolledAndAvailableCourses(enrollment);
        }
    };

    // ------------------------------------------------------------------
    // ➕➖ Lógica de Inscripción/Anulación de Cursos
    // ------------------------------------------------------------------
    const handleCourseAction = async (action: 'enroll' | 'remove', course: AssignmentCourse | EnrolledCourse) => {
        if (!selectedEnrollment) return;
        
        setLoadingCourses(true); 
        setError(null);
        setSuccessMessage(null);
        
        try {
            let response;
            const headers = getAuthHeaders();
            const studentId = selectedEnrollment.student_id;
            const enrollmentId = selectedEnrollment.id;
            
            if (!selectedEnrollment.academicPeriod || !selectedEnrollment.academicPeriod.id) {
                 throw new Error("Error fatal: El ID del periodo se perdió. Vuelva a seleccionar la matrícula.");
            }

            if (action === 'enroll') {
                const courseToEnroll = course as AssignmentCourse;
                response = await fetch(`${API_BASE_URL}/register-course`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        student_id: studentId,
                        assignment_id: courseToEnroll.assignment_id,
                        enrollment_id: enrollmentId,
                        course_id: courseToEnroll.course_id 
                    }),
                });
            } else { // 'remove'
                const courseToRemove = course as EnrolledCourse;
                response = await fetch(`${API_BASE_URL}/remove-course/${courseToRemove.grade_id}`, { 
                    method: 'DELETE',
                    headers: headers,
                    body: JSON.stringify({ 
                        enrollment_id: enrollmentId,
                        course_id: courseToRemove.course_id
                    })
                });
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Fallo al ${action === 'enroll' ? 'inscribir' : 'anular'} el curso.`);
            }
            
            // Recargar ambas listas de cursos
            await fetchEnrolledAndAvailableCourses(selectedEnrollment);

            setSuccessMessage(`Curso ${action === 'enroll' ? 'inscrito' : 'anulado'} correctamente.`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingCourses(false);
        }
    };

    // 💡 ==========================================================
    // 💡 3. FUNCIÓN DE EXPORTACIÓN (NUEVA)
    // 💡 ==========================================================
    const handleExportCSV = async () => {
        setLoading(true); // Reutilizamos el loader principal
        setError(null);
        setSuccessMessage(null);
        try {
            // 1. Llamar al nuevo endpoint del backend
            const response = await fetch(`${API_BASE_URL}/full-roster`, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al generar la nómina.');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                setError("No hay datos de estudiantes inscritos en cursos para exportar.");
                return;
            }

            // 2. Llamar al helper de descarga
            const date = new Date().toISOString().split('T')[0];
            downloadCSV(data, `nomina_matricula_${date}.csv`);
            setSuccessMessage("Nómina exportada exitosamente.");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error al exportar CSV:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // Función simple para formatear la fecha
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString); 
            if (isNaN(date.getTime())) return 'Fecha Inválida';
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC' 
            });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Error formateando fecha:", e.message);
            return 'Fecha inválida';
        }
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (UI)
    // ------------------------------------------------------------------
    return (
        <div className="space-y-8 p-4 md:p-6">
            {/* 💡 4. Encabezado Actualizado con Botón de Exportar */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <ClipboardList className="w-7 h-7 mr-3 text-sky-600" />
                    Consulta y Gestión de Matrículas
                </h1>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/enrollment/register')} 
                        className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Registrar
                    </button>
                    <button
                        onClick={handleExportCSV} // 💡 Botón de Exportar
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition duration-150 shadow-md disabled:bg-green-400"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Exportar Nómina (CSV)
                    </button>
                </div>
            </header>

            {/* Mensaje de Error (si existe un error de operación) */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    <AlertTriangle className="w-5 h-5 inline mr-2" />
                    Error: {error}
                </div>
            )}
            {successMessage && (
                 <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Éxito: {successMessage}
                </div>
            )}


            {/* ... Tabla de Matrículas (Maestro) ... */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando matrículas...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Estudiante
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Programa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Proceso / Periodo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron matrículas registradas.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className={clsx(
                                            "hover:bg-sky-50 transition duration-150 cursor-pointer",
                                            selectedEnrollment?.id === item.id && "bg-sky-100" 
                                        )}
                                        onClick={() => handleRowClick(item)} 
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <User className="w-4 h-4 mr-2 inline text-slate-500" />
                                            {item.student_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <BookOpen className="w-4 h-4 mr-1 inline text-slate-500" />
                                            {item.program_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {item.admission_process}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {formatDate(item.enrolled_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                item.status === 'matriculado' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            )}>
                                                {item.status === 'matriculado' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleRowClick(item); 
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                                                title="Gestionar Cursos"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmDelete(item.id, `matrícula de ${item.student_name}`);
                                                }}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition"
                                                title="Anular Matrícula"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ==========================================================
             * 💡 SECCIÓN DE DETALLE (Inscripción de Cursos)
             ========================================================== */}
            {selectedEnrollment && (
                <section className="mt-10 pt-6 border-t-2 border-dashed border-slate-300">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        Gestionar Cursos para: <span className="text-sky-600">{selectedEnrollment.student_name}</span>
                    </h2>
                    
                    {loadingCourses ? (
                         <div className="text-center py-10 text-slate-500 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Cargando cursos disponibles...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Cursos Inscritos */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Cursos Inscritos
                                </h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {enrolledCourses.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">Aún no hay cursos inscritos.</p>
                                    ) : (
                                        enrolledCourses.map(course => (
                                            <div key={course.grade_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{course.course_name}</p>
                                                    <p className="text-xs text-slate-500">{course.teacher_name} (Turno: {course.shift})</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleCourseAction('remove', course)} 
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Anular Curso"
                                                    disabled={loading}
                                                >
                                                    <MinusCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            {/* Cursos Disponibles */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-sky-600" />
                                    Cursos Disponibles para Inscripción
                                </h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {availableCourses.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">No hay más cursos disponibles.</p>
                                    ) : (
                                        availableCourses.map(course => (
                                            <div key={course.assignment_id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-sky-50">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{course.course_name}</p>
                                                    <p className="text-xs text-slate-500">{course.teacher_name} (Turno: {course.shift})</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleCourseAction('enroll', course)} 
                                                    className="text-green-600 hover:text-green-800 transition"
                                                    title="Inscribir Curso"
                                                    disabled={loading}
                                                >
                                                    <PlusCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ==========================================================
             * 🚨 Modal de Confirmación de Anulación (Se mantiene)
             ========================================================== */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Anular Matrícula</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de eliminar (anular) la **{confirmationModal.itemName}**?
                                    <br />
                                    (Esto anulará también los cursos inscritos en este periodo).
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                onClick={handleDelete}
                            >
                                Sí, Anular
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

