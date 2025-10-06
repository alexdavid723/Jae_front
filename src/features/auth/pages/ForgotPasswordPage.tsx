import { useState } from "react";
import axios from "axios";
// Importar utilidades de navegación e iconos
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react"; 

export default function ForgotPasswordPage() {
  const navigate = useNavigate(); // Para volver al login
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Se ha eliminado el estado 'isSuccess' ya que era redundante.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:4000/api/auth/forgot-password", { email });
      
      // Añadimos el emoji ✅ para que el estilo condicional en el JSX funcione.
      const successMessage = res.data.message || "Se ha enviado un enlace para restablecer tu contraseña. Revisa tu correo.";
      setMessage(`✅ ${successMessage}`);
    } catch (err: unknown) {
      let errorMessage = "Error desconocido";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.message || "Error al enviar correo";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Añadimos el emoji ❌ para que el estilo condicional en el JSX funcione.
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal de pantalla completa
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-inter">
      
      {/* Tarjeta elegante para el formulario */}
      <div className="w-full max-w-md bg-white p-10 sm:p-12 rounded-3xl shadow-2xl shadow-indigo-300/50 border border-white transition-all duration-300">
        
        {/* Encabezado */}
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
          Recuperar Contraseña
        </h1>
        <p className="text-slate-500 mb-8 text-md">
          Ingresa el correo asociado a tu cuenta para recibir un enlace de restablecimiento.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo de Correo con ícono */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tucorreo@institucion.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                           transition-all shadow-inner hover:border-indigo-300"
                required
              />
            </div>
          </div>
          
          {/* Botón de envío con estilo elegante y loader */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3 text-base font-semibold
                         text-white shadow-lg shadow-indigo-500/50 hover:from-indigo-700 hover:to-violet-800 focus:outline-none focus:ring-4
                         focus:ring-indigo-300 transition-all duration-300 disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              "Enviar Enlace de Restablecimiento"
            )}
          </button>
        </form>

        {/* Mensajes de estado con estilo mejorado */}
        {message && (
          <div className={`mt-6 p-3 rounded-xl text-sm text-center font-medium transition-all duration-300 ${message.startsWith('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {/* El mensaje se muestra limpio, sin emojis, ya que el color del contenedor indica el estado */}
            {message.replace(/^[✅❌]\s/, '')}
          </div>
        )}

        {/* Enlace para volver al inicio de sesión */}
        <p className="mt-8 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center justify-center w-full gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
          </button>
        </p>
      </div>
    </main>
  );
}
