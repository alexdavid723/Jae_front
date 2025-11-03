import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import AcademicPeriodFormModal from './AcademicPeriodFormModal';

// ==========================================================
// 🎯 Tipos de Datos
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

const API_BASE_URL = 'http://localhost:4000/api/academic-periods';

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ==========================================================
// 🧩 Modal de Confirmación Reutilizable
// ==========================================================
interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-t-4 border-red-600">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-slate-800">Confirmar Eliminación</h2>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-700 text-sm mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// 🎯 Componente Principal
// ==========================================================
export default function AcademicPeriodsPage() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);

  // Estado del modal de confirmación
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; open: boolean }>({
    id: 0,
    open: false,
  });

  // ------------------------------------------------------------------
  // 🎣 Fetch Periods
  // ------------------------------------------------------------------
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al cargar los períodos.');
      }
      const data: AcademicPeriod[] = await response.json();
      setPeriods(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Error de conexión.');
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // ------------------------------------------------------------------
  // 🗑️ DELETE con confirmación moderna
  // ------------------------------------------------------------------
  const confirmDeletePeriod = (id: number) => {
    setConfirmDelete({ id, open: true });
  };

  const handleDeleteConfirmed = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ id: 0, open: false });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al eliminar el período.');
      }

      setPeriods((prev) => prev.filter((p) => p.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // ------------------------------------------------------------------
  // Modal edición / creación
  // ------------------------------------------------------------------
  const handleOpenModal = (periodToEdit: AcademicPeriod | null = null) => {
    setEditingPeriod(periodToEdit);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchPeriods();
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8 p-4 md:p-0">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <Calendar className="inline w-7 h-7 mr-3 text-sky-600" />
          Gestión de Períodos Académicos
        </h1>
        <button
          onClick={() => handleOpenModal()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition duration-150 shadow-md disabled:bg-sky-400"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Período
        </button>
      </header>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando períodos...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Modalidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Inicio - Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron períodos académicos registrados.
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <tr key={period.id} className="hover:bg-sky-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{period.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{period.year}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Clock className="w-3 h-3 mr-1" /> {period.modality}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                      {formatDate(period.start_date)} - {formatDate(period.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={clsx(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                          period.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}
                      >
                        {period.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" /> Cerrado
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(period)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDeletePeriod(period.id)}
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

      {/* Modal de creación/edición */}
      {isModalOpen && (
        <AcademicPeriodFormModal
          period={editingPeriod}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={handleModalSuccess}
          API_URL={API_BASE_URL}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      {/* Modal de confirmación elegante */}
      {confirmDelete.open && (
        <ConfirmModal
          message="¿Está seguro de eliminar este período académico? Esta acción es irreversible si existen datos dependientes."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete({ id: 0, open: false })}
        />
      )}
    </div>
  );
}
