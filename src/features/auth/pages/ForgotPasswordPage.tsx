// src/features/auth/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:4000/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Revisa tu correo.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setMessage(err.response.data.message || "Error al enviar correo");
      } else if (err instanceof Error) {
        setMessage("Error: " + err.message);
      } else {
        setMessage("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Recuperar contraseña</h1>
      <p className="mb-4 text-sm text-gray-600">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="tucorreo@institucion.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
}
