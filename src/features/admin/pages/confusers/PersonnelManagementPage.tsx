import { useState, useEffect, useCallback } from 'react';
import { User, Plus, Edit2, Trash2, AlertTriangle, Briefcase, Mail, GraduationCap, Search } from 'lucide-react'; 
import clsx from 'clsx';
import PersonnelFormModal from './PersonnelFormModal'; 

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
type UserRole = 'docente' | 'estudiante';

interface PersonnelRecord {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: boolean;
    roleName: UserRole;
    specialization: string | null; 
}

interface ConfirmationModalState {
    isOpen: boolean;
    itemId: number | null;
    itemName: string;
}

// ==========================================================
// ⚙️ Configuración de la API
// ==========================================================
const AUTH_URL_BASE = 'http://localhost:4000/api/auth'; 
const PERSONNEL_LIST_URL = 'http://localhost:4000/api/personnel/list-all-institutional'; 
const AUTH_USER_UPDATE_URL = `${AUTH_URL_BASE}/users`; 

// ==========================================================
// 📘 Componente Principal
// ==========================================================
export default function PersonnelManagementPage() {
    const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal de creación / edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PersonnelRecord | null>(null); 

    // Modal de confirmación
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        itemId: null,
        itemName: '',
    });

    // ============================== 🧭 FILTROS ==============================
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'todos' | UserRole>('todos');
    const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');

    // ------------------------------------------------------------------
    // 📥 Cargar Personal
    // ------------------------------------------------------------------
    const fetchPersonnel = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(PERSONNEL_LIST_URL, { headers: getAuthHeaders() }); 
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al cargar la lista de personal institucional.');
            }
            const data = await response.json();
            setPersonnel(data as PersonnelRecord[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Fetch Personnel Error:', err);
            setError(err.message || 'Error de conexión con el servidor.');
            setPersonnel([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    // ------------------------------------------------------------------
    // 🗑️ Desactivación
    // ------------------------------------------------------------------
    const handleConfirmDelete = (id: number, name: string) => {
        setConfirmationModal({ isOpen: true, itemId: id, itemName: name });
    };

    const handleDelete = async () => {
        const id = confirmationModal.itemId;
        setConfirmationModal({ ...confirmationModal, isOpen: false }); 
        if (!id) return;

        try {
            const response = await fetch(`${AUTH_USER_UPDATE_URL}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: false })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al desactivar la cuenta del usuario.');
            }
            fetchPersonnel(); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    };

    // ------------------------------------------------------------------
    // 📝 Modal de Creación / Edición
    // ------------------------------------------------------------------
    const handleOpenModal = (itemToEdit: PersonnelRecord | null = null) => {
        const itemWithCorrectedId = itemToEdit 
            ? { ...itemToEdit, user_id: itemToEdit.id } 
            : null;
        setEditingItem(itemWithCorrectedId);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchPersonnel();
    };

    // ------------------------------------------------------------------
    // 🔎 Lógica de Filtros (Aplicación local)
    // ------------------------------------------------------------------
    const filteredPersonnel = personnel.filter((item) => {
        const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || item.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'todos' || item.roleName === filterRole;
        const matchesStatus =
            filterStatus === 'todos' ||
            (filterStatus === 'activos' && item.status) ||
            (filterStatus === 'inactivos' && !item.status);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // ------------------------------------------------------------------
    // 🖼️ UI
    // ------------------------------------------------------------------
    if (error && !personnel.length && !loading) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-bold mb-2">Error de carga:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-6">
            {/* Encabezado */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 space-y-3 md:space-y-0">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <User className="w-7 h-7 mr-3 text-sky-600" />
                    Gestión de Personal Institucional
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar Nuevo Usuario
                </button>
            </header>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="flex items-center gap-2 w-full md:w-1/2">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <div className="flex flex-wrap gap-3 justify-between md:justify-end w-full md:w-1/2">
                    <select
                        value={filterRole}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setFilterRole(e.target.value as any)}
                        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="todos">Todos los Roles</option>
                        <option value="docente">Docentes</option>
                        <option value="estudiante">Estudiantes</option>
                    </select>
                    <select
                        value={filterStatus}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="todos">Todos los Estados</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando personal...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    Especialidad
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
                            {filteredPersonnel.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron usuarios que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredPersonnel.map((item) => (
                                    <tr key={item.id} className="hover:bg-sky-50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {item.first_name} {item.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                            <span className={clsx(
                                                "font-semibold",
                                                item.roleName === 'docente' ? 'text-indigo-600' : 'text-green-600'
                                            )}>
                                                {item.roleName.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            <Mail className="w-4 h-4 mr-1 inline text-slate-400" />
                                            {item.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            <Briefcase className="w-4 h-4 mr-1 inline text-slate-500" />
                                            {item.roleName === 'docente' ? (item.specialization || 'N/A') : <GraduationCap className="w-4 h-4 inline text-slate-500"/>}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                item.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {item.status ? 'Activo' : 'Inactivo'}
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
                                                    onClick={() => handleConfirmDelete(item.id, `${item.first_name} ${item.last_name}`)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition"
                                                    title="Desactivar Cuenta"
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

            {/* ========================================================== */}
            {isModalOpen && (
                <PersonnelFormModal
                    item={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleModalSuccess} 
                    AUTH_REGISTER_URL={`${AUTH_URL_BASE}/register`}
                    getAuthHeaders={getAuthHeaders} 
                />
            )}

            {/* ========================================================== */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-bold text-gray-900">Confirmar Desactivación</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    ¿Está seguro de desactivar la cuenta de <b>{confirmationModal.itemName}</b>?
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                onClick={handleDelete}
                            >
                                Sí, Desactivar
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 sm:mt-0"
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
