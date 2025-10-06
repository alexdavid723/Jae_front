export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-red-600">🚫 Acceso Denegado</h1>
        <p className="text-gray-700 mb-6">No tienes permisos para ver esta página.</p>
        <a
          href="/menu-principal"
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Volver al portal
        </a>
      </div>
    </div>
  );
}
