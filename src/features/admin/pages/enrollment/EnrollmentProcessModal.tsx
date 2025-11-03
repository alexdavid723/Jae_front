import { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================
interface AdmissionProcess {
    id: number;
    description: string | null;
    start_date: string;
    end_date: string;
    academic_period_id: number;
}

interface AcademicPeriod { 
    id: number; 
    name: string; 
    is_active?: boolean; 
} 

interface FormState {
    description: string | null;
    start_date: string;
    end_date: string;
    academic_period_id: number | null;
}

interface EnrollmentProcessModalProps {
    item: AdmissionProcess | null; 
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

const PERIODS_API_URL = 'http://localhost:4000/api/academic-periods';

// 💡 CORRECCIÓN: Función robusta para formatear fechas para inputs tipo 'date'
const formatDateForInput = (dateString: string | Date | null): string => {
    try {
        if (!dateString) {
            // Si es nulo o vacío, devolvemos la fecha de hoy
            return new Date().toISOString().split('T')[0];
        }
        
        const date = new Date(dateString);
        
        // Verificamos si la fecha es válida
        if (isNaN(date.getTime())) {
            throw new Error("Fecha inválida recibida");
        }

        // Para inputs 'date', necesitamos 'YYYY-MM-DD'.
        // Ajustamos la zona horaria localmente antes de cortar el string.
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset*60*1000));
        return adjustedDate.toISOString().split('T')[0];
        
    } catch (e) {
        console.error("Error al formatear fecha:", e);
        return new Date().toISOString().split('T')[0]; // Fallback a hoy
    }
};

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function EnrollmentProcessModal({ 
    item, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: EnrollmentProcessModalProps) {
    const isEditing = !!item;
    
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);

    // Estado del formulario (usando la función corregida)
    const [formData, setFormData] = useState<FormState>({
        description: item?.description || '',
        start_date: formatDateForInput(item?.start_date || null),
        end_date: formatDateForInput(item?.end_date || null),
        academic_period_id: item?.academic_period_id || null,
    });

    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // 📥 Cargar Catálogos (Periodos)
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchCatalogs = async () => {
            setCatalogLoading(true);
            try {
                const headers = getAuthHeaders();
                const response = await fetch(PERIODS_API_URL, { headers });

                if (!response.ok) {
                    throw new Error("Fallo al cargar los Periodos Académicos.");
                }
                setPeriods(await response.json());

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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'academic_period_id' ? (value ? Number(value) : null) : value
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (Crear o Editar)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);
        
        if (!formData.academic_period_id || !formData.start_date || !formData.end_date) {
            setSubmissionError("El periodo académico y las fechas son obligatorios.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isEditing ? `${API_URL}/${item!.id}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            // 💡 CORRECCIÓN: Aseguramos que las fechas se envíen en formato ISO (UTC)
            // El input 'date' (YYYY-MM-DD) se interpreta como medianoche en UTC.
            const payload = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
            };
            
            const response = await fetch(endpoint, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Fallo al ${isEditing ? 'editar' : 'crear'} el proceso.`);
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
                        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? 'Editar Proceso de Admisión' : 'Nuevo Proceso de Admisión'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {catalogLoading ? (
                    <div className="text-center py-10 text-slate-500">Cargando Periodos Académicos...</div>
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
                        
                        {/* Descripción */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                            <input type="text" name="description" id="description" value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                        </div>

                        {/* Fechas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Fecha de Inicio <span className="text-red-500">*</span></label>
                                <input type="date" name="start_date" id="start_date" value={formData.start_date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Fecha de Cierre <span className="text-red-500">*</span></label>
                                <input type="date" name="end_date" id="end_date" value={formData.end_date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={isLoading} />
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
                                {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Proceso')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

