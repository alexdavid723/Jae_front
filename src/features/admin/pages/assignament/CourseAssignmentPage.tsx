import { useState, useEffect, useCallback } from 'react';
import {
  ListChecks,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  BookOpen,
  User,
  Clock,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import clsx from 'clsx';
import CourseAssignmentFormModal from './CourseAssignmentFormModal';

// ==========================================================
// ⚙️ FUNCIÓN DE AUTENTICACIÓN
// ==========================================================
const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ==========================================================
// 🎯 Tipos
// ==========================================================
interface AssignmentRecord {
  id: number;
  course_id: number;
  teacher_id: number;
  academic_period_id: number;
  shift: string;
  course_name: string;
  teacher_name: string;
  period_name: string;
}

interface ConfirmationModalState {
  isOpen: boolean;
  itemId: number | null;
  itemName: string;
}

// ==========================================================
// 🌐 API BASE
// ==========================================================
const API_BASE_URL = 'http://localhost:4000/api/assignments';

// ==========================================================
// 📘 COMPONENTE PRINCIPAL
// ==========================================================
export default function CourseAssignmentPage() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssignmentRecord | null>(null);

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    isOpen: false,
    itemId: null,
    itemName: '',
  });

  // ------------------------------------------------------------------
  // 📥 Cargar Asignaciones
  // ------------------------------------------------------------------
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al cargar las asignaciones.');
      }
      const data = await response.json();
      setAssignments(data as AssignmentRecord[]);
      setFilteredAssignments(data as AssignmentRecord[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Fetch Assignments Error:', err);
      setError(err.message || 'Error de conexión con el servidor.');
      setAssignments([]);
      setFilteredAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ------------------------------------------------------------------
  // 🔎 Aplicar Filtros
  // ------------------------------------------------------------------
  useEffect(() => {
    let filtered = assignments;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.course_name.toLowerCase().includes(term) ||
          a.teacher_name.toLowerCase().includes(term) ||
          a.period_name.toLowerCase().includes(term) ||
          a.shift.toLowerCase().includes(term)
      );
    }

    if (selectedShift) {
      filtered = filtered.filter((a) => a.shift === selectedShift);
    }

    if (selectedPeriod) {
      filtered = filtered.filter((a) => a.period_name === selectedPeriod);
    }

    if (selectedTeacher) {
      filtered = filtered.filter((a) => a.teacher_name === selectedTeacher);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, selectedShift, selectedPeriod, selectedTeacher]);

  // ------------------------------------------------------------------
  // 🔽 Opciones únicas
  // ------------------------------------------------------------------
  const uniqueShifts = Array.from(new Set(assignments.map((a) => a.shift))).sort();
  const uniquePeriods = Array.from(new Set(assignments.map((a) => a.period_name))).sort();
  const uniqueTeachers = Array.from(new Set(assignments.map((a) => a.teacher_name))).sort();

  // ------------------------------------------------------------------
  // 🗑️ Eliminar
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
        throw new Error(errData.message || 'Error al eliminar la asignación.');
      }
      fetchItems();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ------------------------------------------------------------------
  // 📝 Modal
  // ------------------------------------------------------------------
  const handleOpenModal = (itemToEdit: AssignmentRecord | null = null) => {
    setEditingItem(itemToEdit);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchItems();
  };

  // ------------------------------------------------------------------
  // 🧹 Limpiar filtros
  // ------------------------------------------------------------------
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedShift('');
    setSelectedPeriod('');
    setSelectedTeacher('');
  };

  // ------------------------------------------------------------------
  // 🖼️ RENDERIZADO
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <ListChecks className="w-7 h-7 mr-3 text-sky-600" />
          Asignación de Cursos a Docentes
        </h1>
        <button
          onClick={() => handleOpenModal()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Asignación
        </button>
      </header>

      {/* Filtros */}
      <section className="bg-slate-50 p-4 rounded-xl shadow-inner flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Búsqueda global */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar curso, docente, periodo..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Filtro por Turno */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Todos los turnos</option>
            {uniqueShifts.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Filtro por Periodo */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Todos los periodos</option>
            {uniquePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Filtro por Docente */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Todos los docentes</option>
            {uniqueTeachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white border border-slate-300 hover:bg-slate-100 transition"
          >
            <Filter className="w-4 h-4 mr-2 text-slate-600" /> Limpiar filtros
          </button>
        </div>
      </section>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          Cargando asignaciones...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Curso / Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron asignaciones.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <BookOpen className="w-4 h-4 mr-2 inline text-slate-500" />
                      {item.course_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">
                      <User className="w-4 h-4 mr-1 inline text-slate-500" />
                      {item.teacher_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                      <Calendar className="w-4 h-4 mr-1 inline text-slate-500" />
                      {item.period_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={clsx(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                          item.shift === 'Mañana' &&
                            'bg-yellow-100 text-yellow-800',
                          item.shift === 'Tarde' &&
                            'bg-blue-100 text-blue-800',
                          item.shift === 'Noche' &&
                            'bg-gray-700 text-white'
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1" /> {item.shift}
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
                          onClick={() =>
                            handleConfirmDelete(
                              item.id,
                              `${item.course_name} (${item.shift})`
                            )
                          }
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

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <CourseAssignmentFormModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={handleModalSuccess}
          API_URL={API_BASE_URL}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      {/* Modal de Confirmación */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                Confirmar Eliminación
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  ¿Está seguro de eliminar la asignación:
                  <strong> "{confirmationModal.itemName}"</strong>?
                  <br />
                  Los estudiantes matriculados podrían perder el acceso.
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                onClick={handleDelete}
              >
                Sí, Eliminar
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                onClick={() =>
                  setConfirmationModal({ ...confirmationModal, isOpen: false })
                }
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
