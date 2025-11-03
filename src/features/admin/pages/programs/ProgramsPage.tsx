import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, BookOpen, AlertTriangle, LayoutList, FileText } from 'lucide-react'; 
import clsx from 'clsx';
import ProgramsCourseFormModal from './ProgramsModal'; 

// ==========================================================
// 🎯 Tipos de Datos (EXPANDIDOS para incluir FKs del backend)
// ==========================================================
interface ProgramCourse {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    is_active: boolean; 
    // Campos de FKs que el backend DEBE devolver para la edición
    plan_id: number;      
    faculty_id: number;   
    // Campos para la visualización en la tabla (vienen del join)
    plan_title: string;
    faculty_name: string;
    // ❌ ELIMINADO: 'modality_type' para evitar confusión con 'shift'
}

interface ConfirmationModalState {
    isOpen: boolean;
    itemId: number | null;
    itemName: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/programs'; 

const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function ProgramsCoursesPage() {
    // Estado de datos y carga
    const [items, setItems] = useState<ProgramCourse[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de Creación/Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProgramCourse | null>(null); 

    // Estado para el Modal de Confirmación de Eliminación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Programas (READ)
    // ------------------------------------------------------------------
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar los programas/carreras.');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                setItems([]); 
                throw new Error('El formato de datos devuelto por el servidor no es correcto.');
            }
            
            setItems(data as ProgramCourse[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Programs Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ------------------------------------------------------------------
    // 🗑️ Lógica de Eliminación (Sin cambios)
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
                throw new Error(errData.message || 'Error al eliminar el programa. Puede tener cursos asociados.');
            }

            setItems((prev) => prev.filter((i) => i.id !== id));
            alert('✅ Programa/Carrera eliminado con éxito.'); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            alert(`❌ Fallo en la eliminación: ${err.message}`);
        }
    };

    // ------------------------------------------------------------------
    // 📝 Modal de Creación / Edición (PASANDO LOS IDS)
    // ------------------------------------------------------------------
    const handleOpenModal = (itemToEdit: ProgramCourse | null = null) => {
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
    if (error && !items.length && !loading) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-bold mb-2">Error de carga:</p>
                <p>{error}</p>
                <p className="mt-2 text-sm">
                    Asegúrate de que la ruta <code>/api/programs</code> esté activa y que tu token sea válido.
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
                    Gestión de Programas / Carreras
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Programa
                </button>
            </header>

            {/* ==========================================================
             * 🔹 Tabla de Programas
             ========================================================== */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando programas...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Programa de estudio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Área/Facultad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Plan Asociado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Duración
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron programas o carreras registradas.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <BookOpen className="w-4 h-4 mr-2 inline text-slate-500" />
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <LayoutList className="w-4 h-4 mr-1 inline text-slate-500" />
                                            {item.faculty_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            <FileText className="w-4 h-4 mr-1 inline text-slate-500" />
                                            {item.plan_title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <span className="font-semibold text-sky-700">
                                                {item.duration_months}
                                            </span> meses
                                        </td>
                                        <td className="px-6 py-4 text-sm hidden md:table-cell">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {item.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
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

            {/* ==========================================================
             * 🔹 Modal para Creación/Edición
             ========================================================== */}
            {isModalOpen && (
                <ProgramsCourseFormModal
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
                                    ¿Está seguro de eliminar el programa **"{confirmationModal.itemName}"**?
                                    <br />
                                    Esta acción es irreversible y podría fallar si tiene cursos o estudiantes asociados.
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
