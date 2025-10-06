// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/auth/reset-password",
        {
          token,
          newPassword,
        }
      );

      setMessage(`✅ ${data.message}`);
      setTimeout(() => navigate("/"), 1500); // redirige al login
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`❌ ${error.response.data.message || "Error desconocido"}`);
      } else if (error instanceof Error) {
        setMessage("❌ " + error.message);
      } else {
        setMessage("❌ Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid lg:grid-cols-2 min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50">
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-500 mb-8">
            Ingresa tu nueva contraseña para tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva contraseña */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500
                           transition-shadow"
                required
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500
                           transition-shadow"
                required
              />
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold
                         text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2
                         focus:ring-sky-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>

          {/* Mensajes */}
          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Lado derecho: imagen */}
      <div className="hidden lg:block bg-gradient-to-br from-sky-100 via-white to-slate-100">
        <div className="flex items-center justify-center h-full">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
            alt="Ilustración"
            className="max-w-md object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </main>
  );
}
