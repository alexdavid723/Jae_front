import { useState } from 'react';
import { X, Save, UserPlus, Edit3 } from 'lucide-react';

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================

type UserRole = 'docente' | 'estudiante';

interface Personnel {
    id: number;
    user_id: number; 
    first_name: string;
    last_name: string;
    email: string;
    status: boolean;
    specialization: string | null;
    password?: string;
    roleName: UserRole; 
}

interface PersonnelFormModalProps {
    item: Personnel | null; 
    onClose: () => void;
    onSaveSuccess: () => void; 
    AUTH_REGISTER_URL: string;
    getAuthHeaders: () => HeadersInit; 
}

// URLs del Backend
const AUTH_USERS_URL = 'http://localhost:4000/api/auth/users';
// ❌ No necesitamos la URL de /api/teachers, authController lo maneja

// ==========================================================
// 📘 Componente Modal de Formulario
// ==========================================================
export default function PersonnelFormModal({ 
    item, 
    onClose, 
    onSaveSuccess, 
    AUTH_REGISTER_URL, 
    getAuthHeaders 
}: PersonnelFormModalProps) {
    const isEditing = !!item;
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        first_name: item?.first_name || '',
        last_name: item?.last_name || '',
        email: item?.email || '',
        specialization: item?.specialization || '',
        password: '',
        confirm_password: '',
        status: item?.status ?? true,
        roleName: item?.roleName || 'docente' as UserRole, 
    });

    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Función para manejar cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Manejo de Envío (CORREGIDO)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);
        
        // ... (Validaciones - sin cambios)
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.roleName) {
            setSubmissionError("Todos los campos requeridos son obligatorios.");
            setLoading(false);
            return;
        }

        if (!isEditing) {
            if (!formData.password || formData.password.length < 6 || formData.password !== formData.confirm_password) {
                setSubmissionError("La contraseña debe ser válida, tener 6+ caracteres y coincidir.");
                setLoading(false);
                return;
            }
        }

        try {
            const headers = getAuthHeaders();
            let response; // Declaramos la respuesta aquí

            if (isEditing) {
                // ====================================================
                // 🔹 FLUJO DE EDICIÓN (PUT) - CORREGIDO
                // ====================================================
                const userId = item!.user_id; 
                
                // 1. Preparamos UN SOLO payload con TODOS los datos
                // El backend (authController) se encarga de separar los campos
                const userUpdatePayload = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    status: formData.status,
                    // 💡 AÑADIDO: Enviamos 'specialization' al endpoint principal
                    specialization: formData.roleName === 'docente' ? formData.specialization : undefined,
                };

                // 2. Hacemos UNA SOLA llamada al endpoint de auth/users
                response = await fetch(`${AUTH_USERS_URL}/${userId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(userUpdatePayload),
                });
                
            } else {
                // ====================================================
                // 🔹 FLUJO DE CREACIÓN (POST a Register)
                // ====================================================
                const registerPayload = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password,
                    roleName: formData.roleName, 
                    ...(formData.roleName === 'docente' && { specialization: formData.specialization }), 
                };

                response = await fetch(AUTH_REGISTER_URL, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(registerPayload),
                });
            }

            // 3. Manejo de respuesta unificado
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const actionText = isEditing ? 'actualizar' : 'crear';
                throw new Error(errData.message || `Fallo al ${actionText} el usuario.`);
            }

            // Éxito: Cierra el modal y recarga la tabla
            onSaveSuccess();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
             setSubmissionError(error.message || "Fallo en la comunicación con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (Sin cambios, se mantiene igual)
    // ------------------------------------------------------------------
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl mx-4 transform transition-all">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        {isEditing ? <Edit3 className="w-5 h-5 mr-2 text-indigo-600" /> : <UserPlus className="w-5 h-5 mr-2 text-indigo-600" />}
                        {isEditing ? `Editar Usuario: ${item?.first_name} ${item?.last_name}` : `Registrar Nuevo Usuario`}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* SELECTOR DE ROL (Solo en Creación) */}
                    {!isEditing && (
                        <div>
                            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Tipo de Usuario a Registrar <span className="text-red-500">*</span></label>
                            <select
                                name="roleName"
                                id="roleName"
                                value={formData.roleName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white"
                                disabled={loading}
                            >
                                <option value="docente">Docente</option>
                                <option value="estudiante">Estudiante</option>
                            </select>
                        </div>
                    )}
                    
                    {/* Campos de Nombre y Apellido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="first_name" id="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={loading} />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input type="text" name="last_name" id="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={loading} />
                        </div>
                    </div>

                    {/* Campo de Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Usuario)</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" 
                            disabled={loading || isEditing} 
                        />
                         {isEditing && <p className="text-xs text-slate-500 mt-1">El email no puede ser editado para evitar conflictos de unicidad.</p>}
                    </div>

                    {/* Campo de Especialización (Solo para Docentes o si se está editando a un Docente) */}
                    {(formData.roleName === 'docente' || item?.roleName === 'docente') && (
                        <div>
                            <label htmlFor="specialization" className="block text-sm font-sm font-medium text-gray-700">Especialidad</label>
                            <input type="text" name="specialization" id="specialization" value={formData.specialization || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={loading} />
                        </div>
                    )}
                    
                    {/* Contraseñas (Solo para Creación) */}
                    {!isEditing && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
                                <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={loading} />
                            </div>
                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña <span className="text-red-500">*</span></label>
                                <input type="password" name="confirm_password" id="confirm_password" value={formData.confirm_password} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" disabled={loading} />
                            </div>
                        </div>
                    )}
                    
                    {/* Estado (Solo en Edición) */}
                    {isEditing && (
                        <div className="flex items-center pt-2">
                            <input
                                id="status"
                                name="status"
                                type="checkbox"
                                checked={formData.status}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                                Cuenta Activa (Permitir Acceso)
                            </label>
                        </div>
                    )}

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
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
