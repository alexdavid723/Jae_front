import { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================

interface Specialization {
    id: number;
    name: string;
    description: string | null;
    teachersCount: number; // El modal no usa esto, pero item lo trae
}

interface SpecializationFormModalProps {
    item: Specialization | null; 
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function SpecializationFormModal({ 
    item, 
    onClose, 
    onSaveSuccess, 
    API_URL, 
    getAuthHeaders 
}: SpecializationFormModalProps) {
    const isEditing = !!item;
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
    });

    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Función para manejar cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (Crear o Editar)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);
        
        if (!formData.name.trim()) {
            setSubmissionError("El nombre de la especialidad es obligatorio.");
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
                throw new Error(errData.message || `Fallo al ${isEditing ? 'editar' : 'crear'} la especialidad.`);
            }

            // Éxito: Cierra el modal y notifica al padre (que recargará la lista)
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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                        {isEditing ? `Editar Especialidad: ${item?.name}` : 'Crear Nueva Especialidad'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre de la Especialidad <span className="text-red-500">*</span>
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

                    {/* Campo Descripción */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción (Opcional)
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
                            disabled={loading}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}