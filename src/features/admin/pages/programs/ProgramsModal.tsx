import { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos (Asumimos que item PUEDE incluir los IDs)
// ==========================================================
interface ProgramCourse {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    is_active: boolean; 
    // Los IDs deben ser números o null, no opcionales (?) en el estado
    plan_id?: number | null; 
    faculty_id?: number | null;
}

interface Plan {
    id: number;
    title: string;
}

interface Faculty {
    id: number;
    name: string;
}

interface ProgramsCourseFormModalProps {
    item: ProgramCourse | null; // El programa a editar, o null si es nuevo
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string;
    getAuthHeaders: () => HeadersInit;
}

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function ProgramsCourseFormModal({
    item,
    onClose,
    onSaveSuccess,
    API_URL,
    getAuthHeaders,
}: ProgramsCourseFormModalProps) {
    const isEditing = !!item;
    
    // Estado para los catálogos
    const [plans, setPlans] = useState<Plan[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    
    // Estado local del formulario
    const [formData, setFormData] = useState<ProgramCourse>({
        id: item?.id || 0,
        name: item?.name || '',
        description: item?.description || '',
        duration_months: item?.duration_months || 12,
        is_active: item?.is_active ?? true,
        // Inicialización: Usamos null para que el <select> muestre el placeholder (valor 0)
        plan_id: null, 
        faculty_id: null,
    });
    
    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    // 💡 NUEVO ESTADO: Para saber si estamos cargando los detalles del item a editar
    const [detailsLoading, setDetailsLoading] = useState(isEditing); 
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 1. Cargar Catálogos (Planes y Facultades)
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                // Fetch Planes (/api/plans)
                const plansResponse = await fetch('http://localhost:4000/api/plans', { headers: getAuthHeaders() });
                const plansData = await plansResponse.json();
                if (plansResponse.ok && Array.isArray(plansData)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setPlans(plansData.map((p: any) => ({ id: p.id, title: p.title })));
                }

                // Fetch Facultades (/api/faculties)
                const facultiesResponse = await fetch('http://localhost:4000/api/faculties', { headers: getAuthHeaders() });
                const facultiesData = await facultiesResponse.json();
                if (facultiesResponse.ok && Array.isArray(facultiesData)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setFaculties(facultiesData.map((f: any) => ({ id: f.id, name: f.name })));
                }
            } catch (err) {
                console.error("Error fetching catalogs:", err);
                setSubmissionError("Error al cargar los catálogos necesarios (Planes/Facultades).");
            } finally {
                setCatalogLoading(false);
            }
        };

        fetchCatalogs();
    }, [getAuthHeaders]);


    // ------------------------------------------------------------------
    // ⚙️ 2. Manejo de Inicialización para Edición (Fetch de detalles por ID)
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!isEditing || !item || !item.id) return;
        
        const fetchItemDetails = async () => {
            setDetailsLoading(true);
            try {
                const response = await fetch(`${API_URL}/${item.id}`, { headers: getAuthHeaders() });
                
                if (!response.ok) {
                    throw new Error("No se pudieron cargar los detalles del programa para la edición.");
                }
                
                const detailedItem = await response.json();
                
                // 💡 Aplicamos los detalles completos al formulario
                setFormData({
                    id: detailedItem.id,
                    name: detailedItem.name || '',
                    description: detailedItem.description || '',
                    duration_months: detailedItem.duration_months || 0,
                    is_active: detailedItem.is_active ?? false,
                    // Estos IDs son cruciales para preseleccionar los <select>
                    plan_id: detailedItem.plan_id || null, 
                    faculty_id: detailedItem.faculty_id || null,
                });
                
            } catch (err) {
                 console.error("Error fetching item details:", err);
                 setSubmissionError("Error al cargar los detalles para editar.");
            } finally {
                setDetailsLoading(false);
            }
        };

        // Si los catálogos ya están cargados, buscamos los detalles
        if (!catalogLoading) {
            fetchItemDetails();
        }

    }, [isEditing, item, API_URL, getAuthHeaders, catalogLoading]);


    // Función genérica para manejar cambios en los campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                // Convierte a entero solo si el valor no es un string vacío (para los selects)
                : (['duration_months', 'plan_id', 'faculty_id'].includes(name) 
                    ? (value ? parseInt(value) : null)
                    : value
                  ),
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (Guardar o Editar)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);

        // Validación de campos esenciales y FKs
        if (!formData.name.trim() || !formData.plan_id || !formData.faculty_id || Number(formData.duration_months) < 1) {
            setSubmissionError("Todos los campos obligatorios (nombre, duración, Plan y Facultad) deben estar seleccionados.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isEditing ? `${API_URL}/${item!.id}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            // Preparamos el cuerpo de la solicitud (incluyendo solo los campos de la base de datos)
            const payload = {
                name: formData.name,
                description: formData.description,
                is_active: formData.is_active,
                duration_months: Number(formData.duration_months),
                // Aseguramos que los IDs sean números válidos para el backend
                plan_id: Number(formData.plan_id),
                faculty_id: Number(formData.faculty_id),
            }
            
            const response = await fetch(endpoint, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Fallo al ${isEditing ? 'editar' : 'crear'} el programa.`);
            }

            onSaveSuccess();
            alert(`✅ Programa guardado con éxito.`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Submission Error:', err);
            setSubmissionError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isFullyLoading = loading || catalogLoading || detailsLoading;

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO
    // ------------------------------------------------------------------
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
                
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? `Editar Programa: ${item?.name}` : 'Crear Nuevo Programa'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isFullyLoading ? (
                    <div className="text-center py-10 text-slate-500">Cargando catálogos y detalles del programa...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* SELECT PLAN DE ESTUDIO */}
                        <div>
                            <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700">
                                Plan de Estudio Asociado <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="plan_id"
                                id="plan_id"
                                // 💡 Valor: Usamos Number(formData.plan_id) o 0
                                value={Number(formData.plan_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                                disabled={loading}
                            >
                                <option value={0} disabled>Seleccione un Plan...</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.title}
                                    </option>
                                ))}
                            </select>
                            {plans.length === 0 && <p className="text-red-500 text-xs mt-1">No hay planes. Cree uno primero.</p>}
                        </div>

                        {/* SELECT FACULTAD / ÁREA */}
                        <div>
                            <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">
                                Facultad / Área <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="faculty_id"
                                id="faculty_id"
                                // 💡 Valor: Usamos Number(formData.faculty_id) o 0
                                value={Number(formData.faculty_id) || 0}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                                disabled={loading}
                            >
                                <option value={0} disabled>Seleccione un Área...</option>
                                {faculties.map((faculty) => (
                                    <option key={faculty.id} value={faculty.id}>
                                        {faculty.name}
                                    </option>
                                ))}
                            </select>
                             {faculties.length === 0 && <p className="text-red-500 text-xs mt-1">No hay áreas. Cree una primero.</p>}
                        </div>
                        
                        {/* Campo Nombre */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre del Programa/Carrera <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={loading}
                            />
                        </div>

                        {/* Campo Duración (Meses) */}
                        <div>
                            <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700">
                                Duración (en meses) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="duration_months"
                                id="duration_months"
                                value={formData.duration_months}
                                onChange={handleChange}
                                min="1"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={loading}
                            />
                        </div>

                        {/* Campo Descripción */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={loading}
                            />
                        </div>

                        {/* Campo Estado (is_active) */}
                        <div className="flex items-center pt-2">
                            <input
                                id="is_active"
                                name="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Programa Activo (Vigente)
                            </label>
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
                                disabled={isFullyLoading}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Programa')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
