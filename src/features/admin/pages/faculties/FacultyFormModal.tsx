import React, { useState } from 'react';
import { X, Building2, FileText } from 'lucide-react';


// ==========================================================
// 🎯 Tipos de Datos (Basados en el componente padre)
// ==========================================================
interface Faculty {
    id: number;
    name: string;
    description: string | null;
    programsCount: number; // No se usa en el formulario, pero es parte del tipo
}

type FormData = {
    name: string;
    description: string;
};

interface ModalProps {
    faculty: Faculty | null; // Null para crear, objeto para editar
    onClose: () => void;
    onSaveSuccess: () => void; // Callback para recargar la tabla principal
    API_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

// ==========================================================
// 🎯 Componente Modal
// ==========================================================
export default function FacultyFormModal({ 
    faculty, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: ModalProps) {
    
    const isEditing = !!faculty;
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Inicialización del estado del formulario
    const [formData, setFormData] = useState<FormData>({
        name: faculty ? faculty.name : '',
        description: faculty?.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // ------------------------------------------------------------------
    // 💾 LÓGICA DE ENVÍO Y API (CREATE & UPDATE)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormError(null);
        
        // Determinar método y URL
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${faculty?.id}` : API_URL;

        // Validación simple:
        if (!formData.name.trim()) {
            setFormError("El nombre del Área/Facultad es obligatorio.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                // Captura el error de unicidad que corregimos en el backend
                throw new Error(errData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el área.`);
            }
            
            // Éxito: Notificar al componente padre
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
        // Overlay (Fondo oscuro)
        <div 
            className="fixed inset-0 bg-slat-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose} 
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 border-t-4 border-sky-600"
                onClick={(e) => e.stopPropagation()} 
            >
                
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-sky-600" />
                        {isEditing ? 'Editar Área' : 'Crear Nueva Área'}
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
                    
                    {/* Nombre del Área */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">Nombre del Área/Facultad</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 transition"
                            placeholder="Ej: Industrias Alimentarias o Estética Personal"
                            disabled={isSaving}
                        />
                    </div>
                    
                    {/* Descripción */}
                    <div>
                        <label className=" text-sm font-semibold text-slate-700 mb-1 flex items-center" htmlFor="description">
                            <FileText className='w-4 h-4 mr-1 text-slate-500'/> Descripción (Opcional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 transition"
                            placeholder="Breve detalle sobre los programas que contendrá esta área..."
                            disabled={isSaving}
                        />
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
                            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-md transition disabled:bg-sky-400"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Área'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}