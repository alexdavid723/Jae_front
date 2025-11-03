import { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================

// El item que se pasa al modal
interface CourseRecord {
    id: number;
    code: string;
    name: string;
    credits: number;
    semester: number;
    program_id: number;
}

// Tipo para el catálogo de Programas que cargaremos
interface Program {
    id: number;
    name: string; // El controlador de Programas devuelve 'name'
}

// Estado interno del formulario
interface FormState {
    program_id: number | null;
    code: string;
    name: string;
    credits: number;
    semester: number;
}

interface CourseFormModalProps {
    item: CourseRecord | null; 
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string; // Endpoint de Cursos (/api/courses)
    getAuthHeaders: () => HeadersInit; 
}

// 💡 CORRECCIÓN DE RUTA:
// Apuntamos al endpoint principal de programas que ya existe y está protegido.
const PROGRAMS_API_URL = 'http://localhost:4000/api/programs'; 

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function CourseFormModal({ 
    item, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: CourseFormModalProps) {
    const isEditing = !!item;
    
    // Estados para los catálogos
    const [programs, setPrograms] = useState<Program[]>([]);

    // Estado del formulario
    const [formData, setFormData] = useState<FormState>({
        program_id: item?.program_id || null,
        code: item?.code || '',
        name: item?.name || '',
        credits: item?.credits || 0,
        semester: item?.semester || 1,
    });

    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Catálogos (Programas)
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchCatalogs = async () => {
            setCatalogLoading(true);
            try {
                const headers = getAuthHeaders();
                // 💡 Usamos la URL corregida
                const response = await fetch(PROGRAMS_API_URL, { headers });

                if (!response.ok) {
                    throw new Error("Fallo al cargar los Programas (carreras).");
                }
                
                const data = await response.json();
                
                // Aseguramos que la data (que es el array de ProgramRecord)
                // se mapee a la interfaz simple { id, name }
                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setPrograms(data.map((p: any) => ({ id: p.id, name: p.name })));
                } else {
                    throw new Error("La respuesta de Programas no es un array.");
                }

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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'credits' || name === 'semester' || name === 'program_id') ? (value ? parseInt(value) : null) : value
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
        if (!formData.program_id || !formData.name || !formData.code || formData.credits < 0 || formData.semester < 1) {
            setSubmissionError("Todos los campos obligatorios deben estar completos y ser válidos.");
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
                if (errData.message && errData.message.includes("código del curso ya existe")) {
                    throw new Error("El código del curso ya está en uso. Debe ser único.");
                }
                throw new Error(errData.message || `Fallo al ${isEditing ? 'editar' : 'crear'} el curso.`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl mx-4 transform transition-all">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? 'Editar Curso' : 'Nuevo Curso o Módulo'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {catalogLoading ? (
                    <div className="text-center py-10 text-slate-500">Cargando Programas...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Programa al que pertenece */}
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
                        
                        {/* Código del Curso */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código del Curso <span className="text-red-500">*</span></label>
                            <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                        </div>

                        {/* Nombre del Curso */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Curso/Módulo <span className="text-red-500">*</span></label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                        </div>

                        {/* Créditos y Semestre */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Créditos <span className="text-red-500">*</span></label>
                                <input type="number" name="credits" id="credits" value={formData.credits} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semestre/Ciclo <span className="text-red-500">*</span></label>
                                <input type="number" name="semester" id="semester" value={formData.semester} onChange={handleChange} required min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                            </div>
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
                                {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Curso')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

