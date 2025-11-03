import { useState, useEffect, useCallback } from 'react';
import { ClipboardEdit, Save, X, AlertTriangle, Loader2 } from 'lucide-react'; 

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================

// El item que se pasa al modal (desde la lista)
interface EnrollmentRecord {
    id: number;
    status: string; 
    student_id: number;
    program_id: number;
    admission_process_id: number;
    student_name?: string; // (Opcional, para el título)
}

// Catálogos
interface Student { 
    id: number; 
    user?: { first_name: string; last_name: string }; 
    // Soporte para el formato aplanado de 'students-simple'
    first_name?: string;
    last_name?: string;
}
interface Program { id: number; name: string; }
interface AdmissionProcess { id: number; description: string | null; academicPeriod: { name: string }; }

// Formulario
interface FormState {
    student_id: number | null;
    program_id: number | null;
    admission_process_id: number | null;
    status: string; 
}

interface EnrollmentModificationModalProps {
    item: EnrollmentRecord | null; // 💡 Recibe el item completo
    onClose: () => void;
    onSaveSuccess: () => void;
    getAuthHeaders: () => HeadersInit; 
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const ENROLLMENTS_API_URL = 'http://localhost:4000/api/enrollments';
const STUDENTS_API_URL = 'http://localhost:4000/api/personnel/students-simple';
const PROGRAMS_API_URL = 'http://localhost:4000/api/programs'; 
const ADMISSION_PROCESS_API_URL = 'http://localhost:4000/api/admission-processes';

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function EnrollmentModificationModal({ 
    item, // 💡 Usamos 'item'
    onClose, 
    onSaveSuccess, 
    getAuthHeaders 
}: EnrollmentModificationModalProps) {
    
    // Estados para los catálogos
    const [students, setStudents] = useState<Student[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [processes, setProcesses] = useState<AdmissionProcess[]>([]);

    // Estado del formulario
    // 💡 CORRECCIÓN: Rellenamos el formulario directamente desde 'item'
    const [formData, setFormData] = useState<FormState>({
        student_id: item?.student_id || null,
        program_id: item?.program_id || null,
        admission_process_id: item?.admission_process_id || null,
        status: item?.status || 'matriculado',
    });

    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Catálogos (SOLO catálogos)
    // ------------------------------------------------------------------
    const fetchCatalogs = useCallback(async () => {
        if (!item) { // Verificación de seguridad
            setSubmissionError("No se recibió el item de matrícula.");
            setCatalogLoading(false);
            return;
        }
        
        setCatalogLoading(true);
        try {
            const headers = getAuthHeaders();
            
            // 1. Cargar todos los catálogos en paralelo
            const [studentsRes, programsRes, processesRes] = await Promise.all([
                fetch(STUDENTS_API_URL, { headers }),
                fetch(PROGRAMS_API_URL, { headers }),
                fetch(ADMISSION_PROCESS_API_URL, { headers })
            ]);

            if (!studentsRes.ok || !programsRes.ok || !processesRes.ok) {
                throw new Error("Fallo al cargar los catálogos necesarios.");
            }
            
            // Mapeo de Estudiantes (para manejar ambos formatos de API)
            const studentsData = await studentsRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setStudents(studentsData.map((s: any) => ({
                id: s.id,
                first_name: s.first_name || s.user?.first_name || 'Estudiante',
                last_name: s.last_name || s.user?.last_name || 'Inválido'
            })));
            
            // Mapeo de Programas (para asegurar formato {id, name})
            const programData = await programsRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPrograms(programData.map((p: any) => ({ id: p.id, name: p.name })));
            
            setProcesses(await processesRes.json());
            
            // 💡 NOTA: No necesitamos hacer fetch de los detalles de la matrícula
            // porque ya los recibimos en la prop 'item'.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setSubmissionError(err.message || "Error al cargar datos.");
        } finally {
            setCatalogLoading(false);
        }
    }, [getAuthHeaders, item]); // 'item' es ahora una dependencia

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    // Función genérica para manejar cambios
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? value : (value ? Number(value) : null)
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (Solo Editar)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);
        
        if (!formData.student_id || !formData.program_id || !formData.admission_process_id || !formData.status) {
            setSubmissionError("Todos los campos son obligatorios.");
            setLoading(false);
            return;
        }

        try {
            // Usamos item.id para construir la URL del PUT
            const response = await fetch(`${ENROLLMENTS_API_URL}/${item!.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Fallo al actualizar la matrícula.`);
            }

            onSaveSuccess();

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl mx-4 transform transition-all">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <ClipboardEdit className="w-5 h-5 mr-2 text-indigo-600" />
                        Rectificar Matrícula
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Cargando datos de matrícula...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Mensaje de Error (si existe) */}
                        {submissionError && (
                            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                                <AlertTriangle className="w-5 h-5 inline mr-2" />
                                Error: {submissionError}
                            </div>
                        )}

                        {/* Proceso de Admisión */}
                        <div>
                            <label htmlFor="admission_process_id" className="block text-sm font-medium text-gray-700">Proceso de Admisión <span className="text-red-500">*</span></label>
                            <select
                                name="admission_process_id"
                                id="admission_process_id"
                                value={Number(formData.admission_process_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Proceso...</option>
                                {processes.map((p) => (
                                    <option key={p.id} value={p.id}>{p.description || p.academicPeriod.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Estudiante */}
                        <div>
                            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">Estudiante <span className="text-red-500">*</span></label>
                            <select
                                name="student_id"
                                id="student_id"
                                value={Number(formData.student_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Estudiante...</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>{s.first_name || s.user?.first_name} {s.last_name || s.user?.last_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Programa */}
                        <div>
                            <label htmlFor="program_id" className="block text-sm font-medium text-gray-700">Programa (Carrera) <span className="text-red-500">*</span></label>
                            <select
                                name="program_id"
                                id="program_id"
                                value={Number(formData.program_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value={0} disabled>Seleccione un Programa...</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado de la Matrícula <span className="text-red-500">*</span></label>
                            <select
                                name="status"
                                id="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={isLoading}
                            >
                                <option value="preinscrito">Preinscrito</option>
                                <option value="matriculado">Matriculado</option>
                                <option value="retirado">Retirado</option>
                                <option value="anulado">Anulado</option>
                            </select>
                        </div>

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
                                {loading ? 'Guardando Cambios...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

