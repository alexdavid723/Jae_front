import React, { useState } from 'react';
import { X, CalendarDays, Clock, Settings } from 'lucide-react';

// ==========================================================
// 🎯 Tipos y Configuración
// ==========================================================
interface AcademicPeriod {
    id: number;
    year: number;
    name: string;
    modality: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

type FormData = Omit<AcademicPeriod, 'id'>;

const MODALITIES = ['Semestre', 'Bimestre'];

interface ModalProps {
    period: AcademicPeriod | null;
    onClose: () => void;
    onSaveSuccess: () => void;
    API_URL: string;
    getAuthHeaders: () => HeadersInit;
}

const formatIsoDate = (isoString: string): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
};

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDateString = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return today.toISOString().split('T')[0];
};

// 🚨 Función auxiliar para obtener el día siguiente a una fecha dada
const getDayAfter = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};


// ==========================================================
// 🎯 Componente Modal
// ==========================================================
export default function AcademicPeriodFormModal({
    period,
    onClose,
    onSaveSuccess,
    API_URL,
    getAuthHeaders,
}: ModalProps) {
    const isEditing = !!period;
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Fecha mínima permitida para la fecha de inicio (Hoy o la fecha de inicio actual si editas)
    const todayString = getTodayDateString();
    const minStartDateAllowed = isEditing ? formatIsoDate(period!.start_date) : todayString;

    const [formData, setFormData] = useState<FormData>({
        year: period ? period.year : new Date().getFullYear(),
        name: period ? period.name : '',
        modality: period ? period.modality : MODALITIES[0],
        start_date: period ? formatIsoDate(period.start_date) : '',
        end_date: period ? formatIsoDate(period.end_date) : '',
        is_active: period ? period.is_active : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            is_active: e.target.checked,
        }));
    };

    // ------------------------------------------------------------------
    // 💾 Lógica de envío (Create & Update)
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormError(null);

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${period?.id}` : API_URL;

        try {
            // Conversión de fechas para validación
            const startDateObj = new Date(formData.start_date);
            const endDateObj = new Date(formData.end_date);
            const todayObj = new Date(getTodayDateString());

            // 1. 🚨 VALIDACIÓN: No se permite crear en el pasado
            if (!isEditing && startDateObj < todayObj) {
                throw new Error('La fecha de inicio no puede ser anterior al día de hoy.');
            }
            
            // 2. 🚨 VALIDACIÓN: Fin debe ser estrictamente posterior a Inicio
            if (startDateObj >= endDateObj) {
                throw new Error('La fecha de fin debe ser estrictamente posterior a la fecha de inicio.');
            }
            
            // 3. 🚨 VALIDACIÓN: Evitar que la fecha de fin sea anterior a hoy al crear (redundante si inicio > hoy y fin > inicio, pero explícita)
            if (!isEditing && endDateObj <= todayObj) {
                 throw new Error('La fecha de fin debe ser posterior al día de hoy para un nuevo período.');
            }


            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el período.`);
            }

            onSaveSuccess();
        } catch (err) {
            console.error('API Submission Error:', err);
            const message = err instanceof Error ? err.message : 'Error de red o servidor.';
            setFormError(message);
        } finally {
            setIsSaving(false);
        }
    };

    // ==========================================================
    // 🎨 Estilos visuales
    // ==========================================================
    return (
        <div
            // 🚨 Estilo de fondo solicitado por el usuario
            className="fixed inset-0 bg-slat-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 border-t-4 border-sky-600"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Cabecera */}
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-sky-600" />
                        {isEditing ? 'Editar Período' : 'Nuevo Período'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mensaje de error */}
                {formError && (
                    <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg">
                        {formError}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1" htmlFor="name">
                            Nombre
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                            placeholder="Ej: 2026 - I SEM"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Año y Modalidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1" htmlFor="year">
                                Año
                            </label>
                            <input
                                id="year"
                                name="year"
                                type="number"
                                required
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 transition"
                                placeholder="Ej: 2026"
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label
                                className="text-sm font-semibold text-slate-700 mb-1 flex items-center"
                                htmlFor="modality"
                            >
                                <Clock className="w-4 h-4 mr-1 text-slate-500" /> Modalidad
                            </label>
                            <select
                                id="modality"
                                name="modality"
                                required
                                value={formData.modality}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-sky-500 transition"
                                disabled={isSaving}
                            >
                                {MODALITIES.map((modality) => (
                                    <option key={modality} value={modality}>
                                        {modality}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                className="text-sm font-semibold text-slate-700 mb-1 flex items-center"
                                htmlFor="start_date"
                            >
                                <CalendarDays className="w-4 h-4 mr-1 text-slate-500" /> Inicio
                            </label>
                            <input
                                id="start_date"
                                name="start_date"
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={handleChange}
                                // Límite UX: no permite fechas anteriores a hoy (solo si estás creando)
                                min={minStartDateAllowed} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 transition"
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label
                                className="text-sm font-semibold text-slate-700 mb-1 flex items-center"
                                htmlFor="end_date"
                            >
                                <CalendarDays className="w-4 h-4 mr-1 text-slate-500" /> Fin
                            </label>
                            <input
                                id="end_date"
                                name="end_date"
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={handleChange}
                                // 🚨 Límite UX: La fecha de fin debe ser al menos un día después de la fecha de inicio.
                                min={getDayAfter(formData.start_date)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-sky-500 transition"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center pt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                            disabled={isSaving}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-slate-900">
                            <span className="font-semibold">Activo:</span> Define si este período está disponible.
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end pt-4 space-x-3 border-t border-slate-200">
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
                            {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Período'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}