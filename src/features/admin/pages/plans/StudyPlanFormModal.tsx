import React, { useState } from 'react';
import { X, CalendarDays, GraduationCap } from 'lucide-react';


// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================
interface StudyPlan {
    id: number;
    title: string;
    description: string;
    start_year: number;
    end_year: number;
    status: boolean; // true = vigente, false = inactivo
}

type FormData = Omit<StudyPlan, 'id'>;

interface ModalProps {
    plan: StudyPlan | null; // Plan para editar (null si es creación)
    onClose: () => void;
    onSaveSuccess: () => void; // Función para notificar a StudyPlansPage que recargue
    API_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

// Función auxiliar para generar un array de años para el selector (ej: 2020 a 2030)
const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) {
        years.push(i);
    }
    return years;
};

// ==========================================================
// 🎯 Componente Modal
// ==========================================================
export default function StudyPlanFormModal({ 
    plan, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: ModalProps) {
    
    const isEditing = !!plan;
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Inicialización del estado del formulario
    const [formData, setFormData] = useState<FormData>({
        title: plan ? plan.title : '',
        description: plan ? plan.description : '',
        start_year: plan ? plan.start_year : new Date().getFullYear(),
        end_year: plan ? plan.end_year : new Date().getFullYear() + 4, // 4 años de vigencia por defecto
        status: plan ? plan.status : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.checked
        }));
    };
    
    // ------------------------------------------------------------------
    // 💾 LÓGICA DE ENVÍO Y API (CREATE & UPDATE)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormError(null);
        
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${plan?.id}` : API_URL;

        try {
            // 🚨 Validación de Vigencia
            if (formData.start_year > formData.end_year) {
                throw new Error("El año de inicio no puede ser posterior al año de fin.");
            }
            
            // 🚨 Validación de Vigencia Mínima (Ejemplo: al menos 1 año)
            if (formData.end_year - formData.start_year < 0) {
                 throw new Error("La vigencia debe ser de al menos 1 año.");
            }
            
            // Convertimos start_year y end_year a números antes de enviar
            const payload = {
                ...formData,
                start_year: Number(formData.start_year),
                end_year: Number(formData.end_year),
            };

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el plan de estudio.`);
            }
            
            onSaveSuccess(); 
            
        } catch (err) {
            console.error("API Submission Error:", err);
            const message = err instanceof Error ? err.message : 'Error de red o servidor.';
            setFormError(message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div 
            className="fixed inset-0 bg-slat-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose} 
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 border-t-4 border-indigo-600"
                onClick={(e) => e.stopPropagation()} 
            >
                
                {/* Cabecera */}
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? 'Editar Plan de Estudio' : 'Crear Nuevo Plan Curricular'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Mensaje de Error Global */}
                {formError && (
                    <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Título del Plan */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="title">Título</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 transition"
                            placeholder="Ej: Plan Curricular 2026 (Vigente)"
                            disabled={isSaving}
                        />
                    </div>
                    
                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 transition"
                            placeholder="Detalles sobre la estructura o la versión del plan..."
                            disabled={isSaving}
                        />
                    </div>

                    {/* Años de Vigencia */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center" htmlFor="start_year">
                                <CalendarDays className='w-4 h-4 mr-1 text-slate-500'/> Año de Inicio
                            </label>
                            <select
                                id="start_year"
                                name="start_year"
                                required
                                value={formData.start_year}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-indigo-500 transition"
                                disabled={isSaving}
                            >
                                {getYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center" htmlFor="end_year">
                                <CalendarDays className='w-4 h-4 mr-1 text-slate-500'/> Año de Fin
                            </label>
                            <select
                                id="end_year"
                                name="end_year"
                                required
                                value={formData.end_year}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-indigo-500 transition"
                                disabled={isSaving}
                            >
                                {getYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Estado de Vigencia */}
                    <div className="flex items-center pt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            id="status"
                            name="status"
                            type="checkbox"
                            checked={formData.status}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            disabled={isSaving}
                        />
                        <label htmlFor="status" className="ml-2 block text-sm font-medium text-slate-900">
                            <span className="font-semibold">Plan Vigente:</span> Marcar como el plan curricular activo.
                        </label>
                    </div>
                    
                    {/* Botones de Acción */}
                    <div className="flex justify-end pt-4 space-x-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition disabled:bg-indigo-400"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Plan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}