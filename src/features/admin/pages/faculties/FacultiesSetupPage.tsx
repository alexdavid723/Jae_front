import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, LayoutList, AlertTriangle } from 'lucide-react'; 
import clsx from 'clsx';
import FacultyFormModal from './FacultyFormModal'; 

// ==========================================================
// 🎯 Tipos de Datos
// ==========================================================
interface Faculty {
    id: number;
    name: string;
    description: string | null;
    programsCount: number; 
}

// Tipo para el estado del modal de confirmación
interface ConfirmationModalState {
    isOpen: boolean;
    facultyId: number | null;
    facultyName: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/faculties'; 

const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`, 
});

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function FacultiesSetupPage() {
    // Estado de datos y carga
    const [faculties, setFaculties] = useState<Faculty[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de Creación/Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

    // ESTADO para el Modal de Confirmación de Eliminación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        facultyId: null,
        facultyName: '',
    });

    // ------------------------------------------------------------------
    // 📥 Cargar Facultades/Áreas (READ)
    // ------------------------------------------------------------------
    const fetchFaculties = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar las facultades/áreas.');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                setFaculties([]); 
                throw new Error('El formato de datos devuelto por el servidor no es correcto.');
            }
            
            // Mapeo seguro de datos
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData: Faculty[] = data.map((item: any) => ({
                ...item,
                programsCount: item.programsCount || 0
            }));

            setFaculties(mappedData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Faculties Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setFaculties([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaculties();
    }, [fetchFaculties]);

    // ------------------------------------------------------------------
    // 🗑️ Lógica de Eliminación
    // ------------------------------------------------------------------

    // 1. Abre el modal
    const handleConfirmDelete = (id: number, name: string) => {
        setConfirmationModal({
            isOpen: true,
            facultyId: id,
            facultyName: name,
        });
    };

    // 2. Ejecuta la eliminación (se llama desde el botón del modal)
    const handleDelete = async () => {
        const id = confirmationModal.facultyId;
        setConfirmationModal({ ...confirmationModal, isOpen: false }); 

        if (!id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al eliminar el área. Puede tener programas asociados.');
            }

            setFaculties((prev) => prev.filter((f) => f.id !== id));
            alert('✅ Área/Facultad eliminada con éxito.'); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            alert(`❌ Fallo en la eliminación: ${err.message}`);
        }
    };

    // ------------------------------------------------------------------
    // 📝 Modal de Creación / Edición
    // ------------------------------------------------------------------
    const handleOpenModal = (facultyToEdit: Faculty | null = null) => {
        setEditingFaculty(facultyToEdit);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchFaculties(); // Recarga la tabla después de guardar
    };

    // ------------------------------------------------------------------
    // 🖼️ RENDERIZADO
    // ------------------------------------------------------------------
    if (error && !faculties.length && !loading) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-bold mb-2">Error de carga:</p>
                <p>{error}</p>
                <p className="mt-2 text-sm">
                    Asegúrate de que la ruta <code>/api/faculties</code> esté activa y que tu token sea válido.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-0">
            {/* Encabezado */}
            <header className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <Building2 className="w-7 h-7 mr-3 text-sky-600" />
                    Gestión de Áreas / Facultades
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Área
                </button>
            </header>

            {/* Tabla de Facultades */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando áreas...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Nombre del Área / Facultad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Programas Asociados
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {faculties.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron áreas o facultades registradas.
                                    </td>
                                </tr>
                            ) : (
                                faculties.map((faculty) => (
                                    <tr key={faculty.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            <LayoutList className="w-4 h-4 mr-2 inline text-slate-500" />
                                            {faculty.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <span className={clsx(
                                                "font-semibold",
                                                faculty.programsCount > 0 ? "text-indigo-600" : "text-slate-500"
                                            )}>
                                                {faculty.programsCount}
                                            </span> Programas
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell truncate max-w-xs">
                                            {faculty.description || 'Área general.'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(faculty)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmDelete(faculty.id, faculty.name)}
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
                <FacultyFormModal
                    faculty={editingFaculty}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleModalSuccess}
                    API_URL={API_BASE_URL}
                    getAuthHeaders={getAuthHeaders}
                />
            )}

            {/* ==========================================================
             * Modal de Confirmación de Eliminación 
             ========================================================== */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de eliminar el área **"{confirmationModal.facultyName}"**?
                                    <br />
                                    Esta acción es irreversible y podría fallar si tiene programas asociados.
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