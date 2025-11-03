import { useState, useEffect, useCallback } from 'react';
import { Clipboard, Plus, Edit2, Trash2, AlertTriangle} from 'lucide-react'; 
import clsx from 'clsx';
// Importamos el modal
import EnrollmentProcessModal from './EnrollmentProcessModal'; 

// ==========================================================
// ⚙️ FUNCIÓN DE AUTENTICACIÓN
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});


// ==========================================================
// 🎯 Tipos de Datos (Basados en el modelo 'AdmissionProcess')
// ==========================================================
interface AdmissionProcess {
    id: number;
    description: string | null;
    start_date: string; // Usamos string para fechas ISO
    end_date: string;
    academic_period_id: number;
    
    // Datos de la relación (aplanados por el backend)
    academicPeriod: {
        name: string;
    };
    // 💡 Podríamos añadir un conteo de matriculados
    _count?: {
        enrollments: number;
    };
}

interface ConfirmationModalState {
    isOpen: boolean;
    itemId: number | null; 
    itemName: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
// ⚠️ ¡IMPORTANTE! Debes crear este endpoint en tu backend
const API_BASE_URL = 'http://localhost:4000/api/admission-processes'; 


// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function EnrollmentProcessPage() {
    const [processes, setProcesses] = useState<AdmissionProcess[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AdmissionProcess | null>(null); 

    // Estado para el Modal de Confirmación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Procesos de Admisión (READ)
    // ------------------------------------------------------------------
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() }); 

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar los procesos de admisión.');
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                 setProcesses(data as AdmissionProcess[]);
            } else {
                throw new Error("La respuesta del servidor no es un array.");
            }
           
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Admission Processes Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setProcesses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ------------------------------------------------------------------
    // 🗑️ Lógica de Eliminación
    // ------------------------------------------------------------------
    const handleConfirmDelete = (id: number, name: string) => {
        setConfirmationModal({
            isOpen: true,
            itemId: id,
            itemName: name,
        });
    };

    const handleDelete = async () => {
        const id = confirmationModal.itemId;
        setConfirmationModal({ ...confirmationModal, isOpen: false }); 

        if (!id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al eliminar el proceso.');
            }

            fetchItems();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ------------------------------------------------------------------
    // 📝 Modal de Creación / Edición
    // ------------------------------------------------------------------
    const handleOpenModal = (itemToEdit: AdmissionProcess | null = null) => {
        setEditingItem(itemToEdit);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchItems(); // Recarga la tabla
    };
    
    // 💡 FUNCIÓN CORREGIDA
    const formatDate = (dateString: string) => {
        try {
            // 💡 CORRECCIÓN: Se eliminó .replace(/-/g, '/')
            // new Date() puede parsear fechas ISO (ej: 2025-10-31T05:00:00Z) directamente.
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return 'Fecha Inválida';
            }

            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC' // Trata la fecha como UTC para evitar desfases de un día
            });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (UI)
    // ------------------------------------------------------------------
    if (error && !processes.length && !loading) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-bold mb-2">Error de carga:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-6">
            {/* ... Encabezado ... */}
            <header className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <Clipboard className="w-7 h-7 mr-3 text-sky-600" />
                    Gestión de Matrícula y Admisión
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Proceso de Admisión
                </button>
            </header>

            {/* Mensaje de Error (si existe un error de operación) */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    Error de Operación: {error}
                </div>
            )}

            {/* ... Tabla de Procesos ... */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando procesos de admisión...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Descripción / Periodo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Fecha de Inicio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Fecha de Cierre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Matriculados
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {processes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron procesos de admisión creados.
                                    </td>
                                </tr>
                            ) : (
                                processes.map((item) => (
                                    <tr key={item.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <p>{item.description || "Proceso de Admisión"}</p>
                                            <span className="text-xs text-indigo-600 font-semibold">{item.academicPeriod?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            {formatDate(item.start_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {formatDate(item.end_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="font-semibold text-sky-700">{item._count?.enrollments || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmDelete(item.id, item.description || `ID ${item.id}`)}
                                                    className={clsx(
                                                        "p-1 rounded-md transition",
                                                        (item._count?.enrollments || 0) > 0
                                                        ? "text-slate-400 cursor-not-allowed"
                                                        : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                                    )}
                                                    title={(item._count?.enrollments || 0) > 0 ? "No se puede eliminar, tiene matrículas" : "Eliminar"}
                                                    disabled={(item._count?.enrollments || 0) > 0}
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

            {/* ==========================================================
             * 🔹 Modal de Creación/Edición
             ========================================================== */}
            {isModalOpen && (
                <EnrollmentProcessModal
                    item={editingItem}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de eliminar el proceso: **"{confirmationModal.itemName}"**?
                                    <br />
                                    No podrá eliminarlo si tiene estudiantes matriculados.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
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

