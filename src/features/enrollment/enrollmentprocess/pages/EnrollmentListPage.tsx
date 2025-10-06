import { useState, useEffect } from "react";
import { Search, Printer, X } from "lucide-react";

interface Enrollment {
  id: string;
  student: string;
  dni: string;
  program: string;
  date: string;
  semester: string;
  status: string;
}

export default function EnrollmentListPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // 🟢 Simulación de carga desde backend
  useEffect(() => {
    // Aquí reemplazarías con fetch/axios a tu API: GET /api/enrollments
    const MOCK_ENROLLMENTS: Enrollment[] = [
      { id: "M001", student: "Ana Lucía Torres Vega", dni: "78945612", program: "Desarrollo de Sistemas", date: "2025-10-01", semester: "2025-II", status: "Vigente" },
      { id: "M002", student: "Gabriela Vargas Luna", dni: "79852147", program: "Contabilidad", date: "2025-09-30", semester: "2025-II", status: "Vigente" },
      { id: "M003", student: "Esteban Reyes Pardo", dni: "70011223", program: "Enfermería Técnica", date: "2025-09-29", semester: "2025-I", status: "Retirado" },
    ];
    setEnrollments(MOCK_ENROLLMENTS);
  }, []);

  // 🔍 Filtrar por búsqueda
  const filteredEnrollments = enrollments.filter((e) =>
    [e.id, e.student, e.dni].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Vigente: "bg-sky-100 text-sky-800 border-sky-300",
      Retirado: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          styles[status] || "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        {status}
      </span>
    );
  };

  // 🖨️ Imprimir tabla completa
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Consulta de Matrículas
      </h1>

      {/* 🔎 Barra de búsqueda + acciones */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative md:w-1/3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, estudiante o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition focus:outline-none"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-100 transition duration-150 ease-in-out"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* 📋 Tabla de Matrículas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-100 text-xs text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Cód. Matrícula</th>
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Programa</th>
                <th className="px-6 py-4">Semestre</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="bg-white border-b border-slate-100 hover:bg-slate-50 transition duration-100"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{enrollment.id}</td>
                  <td className="px-6 py-4">{enrollment.student}</td>
                  <td className="px-6 py-4">{enrollment.program}</td>
                  <td className="px-6 py-4">{enrollment.semester}</td>
                  <td className="px-6 py-4 text-slate-500">{enrollment.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(enrollment.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedEnrollment(enrollment)}
                      className="font-medium text-sky-600 hover:text-sky-800 transition duration-150"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEnrollments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    No se encontraron matrículas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🗂️ Modal Ficha de Matrícula */}
      {selectedEnrollment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedEnrollment(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Ficha de Matrícula
            </h2>
            <p><span className="font-semibold">Código:</span> {selectedEnrollment.id}</p>
            <p><span className="font-semibold">Estudiante:</span> {selectedEnrollment.student}</p>
            <p><span className="font-semibold">DNI:</span> {selectedEnrollment.dni}</p>
            <p><span className="font-semibold">Programa:</span> {selectedEnrollment.program}</p>
            <p><span className="font-semibold">Semestre:</span> {selectedEnrollment.semester}</p>
            <p><span className="font-semibold">Fecha:</span> {selectedEnrollment.date}</p>
            <p><span className="font-semibold">Estado:</span> {getStatusBadge(selectedEnrollment.status)}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700"
              >
                Imprimir Ficha
              </button>
              <button
                onClick={() => setSelectedEnrollment(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
