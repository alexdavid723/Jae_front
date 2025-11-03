import { useState } from "react";

interface Program {
  id: number;
  name: string;
  description?: string;
  duration_years: number;
  faculty_name?: string;
}

export default function ProgramsPage() {
  // 🔹 Datos estáticos por el momento
  const [programs] = useState<Program[]>([
    {
      id: 1,
      name: "Ingeniería de Sistemas",
      description: "Programa orientado a desarrollo de software y redes.",
      duration_years: 5,
      faculty_name: "Facultad de Ingeniería"
    },
    {
      id: 2,
      name: "Administración de Empresas",
      description: "Formación en gestión y administración empresarial.",
      duration_years: 4,
      faculty_name: "Facultad de Ciencias Empresariales"
    },
    {
      id: 3,
      name: "Psicología",
      description: "Estudio del comportamiento humano y salud mental.",
      duration_years: 5,
      faculty_name: "Facultad de Ciencias Sociales"
    }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Programas</h1>

      <table className="w-full table-auto border border-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Facultad</th>
            <th className="border px-4 py-2">Años de duración</th>
            <th className="border px-4 py-2">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((prog) => (
            <tr key={prog.id} className="hover:bg-slate-50">
              <td className="border px-4 py-2">{prog.id}</td>
              <td className="border px-4 py-2">{prog.name}</td>
              <td className="border px-4 py-2">{prog.faculty_name || "-"}</td>
              <td className="border px-4 py-2">{prog.duration_years}</td>
              <td className="border px-4 py-2">{prog.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
