interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester: number;
  program_name?: string;
}

export default function CoursesPage() {
  // Datos estáticos
  const courses: Course[] = [
    { id: 1, code: "CS101", name: "Introducción a la programación", credits: 3, semester: 1, program_name: "Ingeniería de Sistemas" },
    { id: 2, code: "CS102", name: "Estructuras de datos", credits: 4, semester: 2, program_name: "Ingeniería de Sistemas" },
    { id: 3, code: "CS201", name: "Bases de datos", credits: 3, semester: 3, program_name: "Ingeniería de Sistemas" },
    { id: 4, code: "CS301", name: "Sistemas Operativos", credits: 4, semester: 4, program_name: "Ingeniería de Sistemas" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cursos</h1>
      <table className="w-full table-auto border border-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Código</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Programa</th>
            <th className="border px-4 py-2">Créditos</th>
            <th className="border px-4 py-2">Semestre</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} className="hover:bg-slate-50">
              <td className="border px-4 py-2">{course.id}</td>
              <td className="border px-4 py-2">{course.code}</td>
              <td className="border px-4 py-2">{course.name}</td>
              <td className="border px-4 py-2">{course.program_name || "-"}</td>
              <td className="border px-4 py-2">{course.credits}</td>
              <td className="border px-4 py-2">{course.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
