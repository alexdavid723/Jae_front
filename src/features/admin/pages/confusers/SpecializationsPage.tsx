import { useState, useEffect, useCallback } from 'react';
import { List, Plus, Edit2, Trash2, AlertTriangle, Briefcase } from 'lucide-react'; 
import clsx from 'clsx';
import SpecializationFormModal from './SpecializationFormModal'; 

// ==========================================================
// ⚙️ FUNCIÓN DE AUTENTICACIÓN
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});


// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================
interface Specialization {
    id: number;
    name: string;
    description: string | null;
    // Asumimos que el backend nos da un conteo de cuántos docentes la usan
    teachersCount: number; 
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
const API_BASE_URL = 'http://localhost:4000/api/specializations'; 


// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function SpecializationsPage() {
    const [specializations, setSpecializations] = useState<Specialization[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de Creación/Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Specialization | null>(null); 

    // Estado para el Modal de Confirmación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Especialidades (READ)
    // ------------------------------------------------------------------
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() }); 

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar las especialidades.');
            }

            const data = await response.json();
            
            // Asumimos que el backend devuelve { id, name, description, _count: { teachers: X } }
            // y lo mapeamos a 'teachersCount'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData = data.map((item: any) => ({
                ...item,
                teachersCount: item._count?.teachers || 0
            }));
            
            setSpecializations(mappedData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Specializations Error:', err);
            setError(err.message || 'Error de conexión con el servidor. Verifica el endpoint.');
            setSpecializations([]);
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
                throw new Error(errData.message || 'Error al eliminar la especialidad.');
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
    const handleOpenModal = (itemToEdit: Specialization | null = null) => {
        setEditingItem(itemToEdit);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchItems(); // Recarga la tabla
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO (UI)
    // ------------------------------------------------------------------
    if (error && !specializations.length && !loading) {
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
                    <List className="w-7 h-7 mr-3 text-sky-600" />
                    Catálogo de Especialidades Docentes
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Especialidad
                </button>
            </header>

            {/* Mensaje de Error (si existe un error de operación) */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    Error de Operación: {error}
                </div>
            )}

            {/* ... Tabla de Especialidades ... */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando especialidades...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Nombre de la Especialidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    N° Docentes
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {specializations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron especialidades registradas.
                                    </td>
                                </tr>
                            ) : (
                                specializations.map((item) => (
                                    <tr key={item.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <Briefcase className="w-4 h-4 mr-2 inline text-slate-500" />
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {item.description || <span className="text-slate-400 italic">Sin descripción</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <span className="font-semibold text-indigo-600">
                                                {item.teachersCount}
                                            </span> Docente(s)
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
                                                    onClick={() => handleConfirmDelete(item.id, item.name)}
                                                    className={clsx(
                                                        "p-1 rounded-md transition",
                                                        item.teachersCount > 0 
                                                        ? "text-slate-400 cursor-not-allowed" 
                                                        : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                                    )}
                                                    title={item.teachersCount > 0 ? "No se puede eliminar, está en uso" : "Eliminar"}
                                                    disabled={item.teachersCount > 0}
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
                <SpecializationFormModal
                    item={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleModalSuccess} 
                    API_URL={API_BASE_URL}
                    getAuthHeaders={getAuthHeaders} 
                />
            )}

            {/* ==========================================================
             * 🚨 Modal de Confirmación de Desactivación
             ========================================================== */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de eliminar la especialidad **"{confirmationModal.itemName}"**?
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