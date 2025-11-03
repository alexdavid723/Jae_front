import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, CheckCircle, XCircle, FileText, Calendar, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import StudyPlanFormModal from './StudyPlanFormModal';

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

interface ConfirmationModalState {
    isOpen: boolean;
    planId: number | null;
    planTitle: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/plans';

const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function StudyPlansPage() {
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de Creación/Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);

    // ESTADO para el Modal de Confirmación de Eliminación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        planId: null,
        planTitle: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Planes (READ)
    // ------------------------------------------------------------------
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar los planes de estudio.');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                console.warn('⚠️ La API devolvió datos no válidos:', data);
                throw new Error('El formato de datos devuelto por el servidor no es correcto.');
            }

            setPlans(data as StudyPlan[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Plans Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // ------------------------------------------------------------------
    // 🗑️ Lógica de Eliminación
    // ------------------------------------------------------------------

    // 1. Abre el modal de confirmación
    const handleConfirmDelete = (id: number, title: string) => {
        setConfirmationModal({
            isOpen: true,
            planId: id,
            planTitle: title,
        });
    };

    // 2. Ejecuta la eliminación (se llama desde el botón del modal)
    const handleDelete = async () => {
        const id = confirmationModal.planId;
        // Cerrar el modal antes de la operación
        setConfirmationModal({ ...confirmationModal, isOpen: false }); 

        if (!id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al eliminar el plan de estudio.');
            }

            setPlans((prev) => prev.filter((p) => p.id !== id));
            alert('✅ Plan de estudio eliminado con éxito.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            alert(`❌ Error: ${err.message}`);
        }
    };

    // ------------------------------------------------------------------
    // 📝 Modal de Creación / Edición
    // ------------------------------------------------------------------
    const handleOpenModal = (planToEdit: StudyPlan | null = null) => {
        setEditingPlan(planToEdit);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchPlans();
    };

    // ------------------------------------------------------------------
    // 🖼️ Renderizado
    // ------------------------------------------------------------------
    if (error && !plans.length && !loading) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-bold mb-2">Error de carga:</p>
                <p>{error}</p>
                <p className="mt-2 text-sm">
                    Asegúrate de que la ruta <code>/api/plans</code> esté activa y que tu token sea válido.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-0">
            {/* ==========================================================
             * 🔹 Encabezado
             ========================================================== */}
            <header className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <GraduationCap className="w-7 h-7 mr-3 text-sky-600" />
                    Gestión de Planes de Estudio
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Plan
                </button>
            </header>

            {/* ==========================================================
             * 🔹 Tabla o indicador de carga
             ========================================================== */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando planes...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Título del Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Vigencia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {plans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron planes de estudio registrados.
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <FileText className="w-4 h-4 mr-2 inline text-slate-500" />
                                            {plan.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <Calendar className="w-4 h-4 mr-1 inline text-slate-500" />
                                            {plan.start_year} - {plan.end_year}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell truncate max-w-xs">
                                            {plan.description || 'Sin descripción.'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                                                    plan.status
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                )}
                                            >
                                                {plan.status ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Vigente
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 mr-1" /> Inactivo
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(plan)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    // MODIFICADO: Llama a la función de confirmación
                                                    onClick={() => handleConfirmDelete(plan.id, plan.title)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para Creación/Edición */}
            {isModalOpen && (
                <StudyPlanFormModal
                    plan={editingPlan}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleModalSuccess}
                    API_URL={API_BASE_URL}
                    getAuthHeaders={getAuthHeaders}
                />
            )}

            {/* ==========================================================
             * 🚨 Modal de Confirmación de Eliminación 
             ========================================================== */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de eliminar el plan **"{confirmationModal.planTitle}"**?
                                    <br />
                                    Esta acción es irreversible.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                onClick={handleDelete}
                            >
                                Sí, Eliminar
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}