import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    GraduationCap,
    UserPlus, 
    Save, 
    AlertTriangle, 
    X, 
} from "lucide-react";
// (Quitamos las importaciones de imágenes 'insignia' y 'entrada' si no se usan aquí)
// import insignia from "@images/insignia.png";
// import entrada from "@images/entrada.png";

// ==========================================================
// ⚙️ AUTENTICACIÓN
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ==========================================================
// 🎯 Tipos
// ==========================================================
interface Student {
    id: number;
    first_name: string;
    last_name: string;
}
interface Program {
    id: number;
    name: string;
}
interface AdmissionProcess {
    id: number;
    description: string | null;
    academicPeriod: { name: string };
}

interface FormState {
    student_id: number | null;
    program_id: number | null;
    admission_process_id: number | null;
    status: string;
}

// ==========================================================
// 🌐 API BASE
// ==========================================================
const API_BASE_URL = "http://localhost:4000/api/enrollments";
const STUDENTS_API_URL =
    "http://localhost:4000/api/personnel/students-simple";
const PROGRAMS_API_URL = "http://localhost:4000/api/programs";
const PROCESSES_API_URL = "http://localhost:4000/api/admission-processes";

// ==========================================================
// 📘 COMPONENTE PRINCIPAL
// ==========================================================
export default function EnrollmentRegistrationPage() {
    const navigate = useNavigate(); 
    
    const [students, setStudents] = useState<Student[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [processes, setProcesses] = useState<AdmissionProcess[]>([]);

    const [formData, setFormData] = useState<FormState>({
        student_id: null,
        program_id: null,
        admission_process_id: null,
        // 💡 CORRECCIÓN: El estado por defecto ahora es 'matriculado'
        status: "matriculado", 
    });

    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ==========================================================
    // 📥 Cargar Catálogos
    // ==========================================================
    const fetchCatalogs = useCallback(async () => {
        setLoadingCatalogs(true);
        setError(null);
        try {
            const headers = getAuthHeaders();
            const [studentsRes, programsRes, processesRes] = await Promise.all([
                fetch(STUDENTS_API_URL, { headers }),
                fetch(PROGRAMS_API_URL, { headers }),
                fetch(PROCESSES_API_URL, { headers }),
            ]);

            if (!studentsRes.ok || !programsRes.ok || !processesRes.ok) {
                let errorMsg = "Fallo al cargar los catálogos necesarios: ";
                if (!studentsRes.ok) errorMsg += "Estudiantes (Verifique API). ";
                if (!programsRes.ok) errorMsg += "Programas (Verifique API). ";
                if (!processesRes.ok) errorMsg += "Procesos de Admisión (Verifique API). ";
                
                throw new Error(errorMsg);
            }
            
            // Mapeo de datos (asumiendo que el backend los envía aplanados)
            const studentData = await studentsRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setStudents(studentData.map((s: any) => ({
                id: s.id,
                first_name: s.first_name || 'Sin Nombre',
                last_name: s.last_name || ''
            })));

            
            const programData = await programsRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPrograms(programData.map((p: any) => ({
                id: p.id,
                name: p.name || 'Sin Nombre'
            })));

            setProcesses(await processesRes.json());
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error fetching catalogs:", err);
            setError(err.message || "Error al cargar catálogos.");
        } finally {
            setLoadingCatalogs(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    // ==========================================================
    // 🔄 Manejadores
    // ==========================================================
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value ? Number(value) : null,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        if (
            !formData.student_id ||
            !formData.program_id ||
            !formData.admission_process_id
        ) {
            setError("Todos los campos son obligatorios.");
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(formData), // 'status' ya está como 'matriculado'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Fallo al crear la matrícula.");
            }

            setSuccess("✅ ¡Matrícula registrada exitosamente!");
            // Reseteamos el formulario
            setFormData({
                student_id: null,
                program_id: null,
                admission_process_id: null,
                status: "matriculado", // 💡 CORRECCIÓN (al resetear)
            });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setError(error.message || "Fallo en la comunicación con el servidor.");
        } finally {
            setSubmitting(false);
        }
    };

    const isLoading = submitting || loadingCatalogs;

    // ==========================================================
    // 🖼️ Renderizado
    // ==========================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 py-10 px-4 md:px-10">
            {/* Encabezado */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center space-x-3">
                    <GraduationCap className="w-10 h-10 text-sky-700" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">
                            Registro de Matrícula
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Complete los datos para registrar un nuevo estudiante matriculado.
                        </p>
                    </div>
                </div>
            </div>

            {/* Card principal */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-5 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Nueva Matrícula
                    </h2>
                    <button
                        onClick={() => navigate('/admin/enrollment-process')} // Vuelve a la lista de Procesos
                        className="flex items-center px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-lg hover:bg-white/30 transition"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Volver
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {loadingCatalogs ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse">
                            Cargando Estudiantes, Programas y Procesos...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Proceso */}
                            <div>
                                <label
                                    htmlFor="admission_process_id"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Proceso de Admisión <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="admission_process_id"
                                    id="admission_process_id"
                                    value={Number(formData.admission_process_id) || 0}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                >
                                    <option value={0} disabled>
                                        Seleccione un Proceso...
                                    </option>
                                    {processes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.description || p.academicPeriod.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Estudiante */}
                            <div>
                                <label
                                    htmlFor="student_id"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Estudiante <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="student_id"
                                    id="student_id"
                                    value={Number(formData.student_id) || 0}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                >
                                    <option value={0} disabled>
                                        Seleccione un Estudiante...
                                    </option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.first_name} {s.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Programa */}
                            <div>
                                <label
                                    htmlFor="program_id"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Programa (Carrera) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="program_id"
                                    id="program_id"
                                    value={Number(formData.program_id) || 0}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                >
                                    <option value={0} disabled>
                                        Seleccione un Programa...
                                    </option>
                                    {programs.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mensajes */}
                            {error && (
                                <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg flex items-center animate-fadeIn">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 text-sm text-green-700 bg-green-100 border border-green-300 rounded-lg animate-fadeIn">
                                    {success}
                                </div>
                            )}

                            {/* Botón */}
                            <div className="flex justify-end pt-6 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-indigo-700 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {submitting ? "Guardando..." : "Registrar Matrícula"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

