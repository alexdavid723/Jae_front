import { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================

// El item que se pasa al modal
interface AssignmentRecord {
    id: number;
    course_id: number;
    teacher_id: number;
    academic_period_id: number;
    shift: string;
}

// Tipos para los catálogos que cargaremos
interface Course { id: number; name: string; }
interface Teacher { id: number; first_name: string; last_name: string; }
interface AcademicPeriod { id: number; name: string; }

// Estado interno del formulario
interface FormState {
    course_id: number | null;
    teacher_id: number | null;
    academic_period_id: number | null;
    shift: string; // 'Mañana', 'Tarde', 'Noche'
}

interface CourseAssignmentFormModalProps {
    item: AssignmentRecord | null; 
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

// ⚠️ URLs de los catálogos (Debes tener estos endpoints en el backend)
// Asumimos endpoints "simples" que solo devuelven listas ligeras
const COURSES_API_URL = 'http://localhost:4000/api/courses/list-simple'; 
const TEACHERS_API_URL = 'http://localhost:4000/api/personnel/teachers-simple';
const PERIODS_API_URL = 'http://localhost:4000/api/academic-periods';

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function CourseAssignmentFormModal({ 
    item, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: CourseAssignmentFormModalProps) {
    const isEditing = !!item;
    
    // Estados para los catálogos
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);

    // Estado del formulario
    const [formData, setFormData] = useState<FormState>({
        course_id: item?.course_id || null,
        teacher_id: item?.teacher_id || null,
        academic_period_id: item?.academic_period_id || null,
        shift: item?.shift || 'Mañana', // Valor por defecto
    });

    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Catálogos (Cursos, Docentes, Periodos)
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchCatalogs = async () => {
            setCatalogLoading(true);
            try {
                const headers = getAuthHeaders();
                // Usamos Promise.all para cargar todo en paralelo
                const [coursesRes, teachersRes, periodsRes] = await Promise.all([
                    fetch(COURSES_API_URL, { headers }),
                    fetch(TEACHERS_API_URL, { headers }),
                    fetch(PERIODS_API_URL, { headers })
                ]);

                if (!coursesRes.ok || !teachersRes.ok || !periodsRes.ok) {
                    throw new Error("Fallo al cargar los catálogos necesarios (Cursos, Docentes o Periodos).");
                }

                setCourses(await coursesRes.json());
                setTeachers(await teachersRes.json());
                setPeriods(await periodsRes.json());

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Error fetching catalogs:", err);
                setSubmissionError(err.message || "Error al cargar catálogos.");
            } finally {
                setCatalogLoading(false);
            }
        };

        fetchCatalogs();
    }, [getAuthHeaders]);

    // Función genérica para manejar cambios
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convertir IDs a número, pero mantener 'shift' como string
            [name]: name === 'shift' ? value : (value ? Number(value) : null) 
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (Crear o Editar)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);
        
        // Validación
        if (!formData.course_id || !formData.teacher_id || !formData.academic_period_id || !formData.shift) {
            setSubmissionError("Todos los campos son obligatorios.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isEditing ? `${API_URL}/${item!.id}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                // Manejo de error de unicidad (P2002)
                if (errData.message && errData.message.includes("Unique constraint failed")) {
                    throw new Error("Ya existe una asignación para este curso en este periodo y turno.");
                }
                throw new Error(errData.message || `Fallo al ${isEditing ? 'editar' : 'crear'} la asignación.`);
            }

            onSaveSuccess(); // Cierra el modal y recarga la tabla (sin alertas)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
             setSubmissionError(error.message || "Fallo en la comunicación con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO
    // ------------------------------------------------------------------
    const isLoading = loading || catalogLoading;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl mx-4 transform transition-all">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? 'Editar Asignación' : 'Nueva Asignación de Curso'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {catalogLoading ? (
                    <div className="text-center py-10 text-slate-500">Cargando Cursos, Docentes y Periodos...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Periodo Académico */}
                        <div>
                            <label htmlFor="academic_period_id" className="block text-sm font-medium text-gray-700">Periodo Académico <span className="text-red-500">*</span></label>
                            <select
                                name="academic_period_id"
                                id="academic_period_id"
                                value={Number(formData.academic_period_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Periodo...</option>
                                {periods.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Curso / Módulo */}
                        <div>
                            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">Curso / Módulo <span className="text-red-500">*</span></label>
                            <select
                                name="course_id"
                                id="course_id"
                                value={Number(formData.course_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Curso...</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Docente */}
                        <div>
                            <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">Docente a Asignar <span className="text-red-500">*</span></label>
                            <select
                                name="teacher_id"
                                id="teacher_id"
                                value={Number(formData.teacher_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Docente...</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Turno */}
                        <div>
                            <label htmlFor="shift" className="block text-sm font-medium text-gray-700">Turno <span className="text-red-500">*</span></label>
                            <select
                                name="shift"
                                id="shift"
                                value={formData.shift}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                            </select>
                        </div>

                        {/* Mensaje de Error */}
                        {submissionError && (
                            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                                Error: {submissionError}
                            </div>
                        )}

                        {/* Botones de Acción */}
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Asignación')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

