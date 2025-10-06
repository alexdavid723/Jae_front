import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email: form.email,
        password: form.password
      })

      // guardar token en localStorage
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      setMessage("✅ Login exitoso, redirigiendo...")
      setTimeout(() => navigate('/menu-principal'), 1000)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        // Muestra el mensaje de error del servidor
        setMessage(`❌ ${err.response.data.message || "Credenciales inválidas"}`)
      } else if (err instanceof Error) {
        setMessage("❌ Error: " + err.message)
      } else {
        setMessage("❌ Error desconocido")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid lg:grid-cols-2 min-h-screen bg-slate-100 font-inter">
      {/* Lado izquierdo: formulario centrado */}
      <div className="flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-sm bg-white p-10 sm:p-12 rounded-3xl shadow-3xl shadow-slate-300/50 border border-white transition-all duration-500 transform hover:scale-[1.005]">
          
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
            Bienvenido
          </h1>
          <p className="text-slate-500 mb-10 text-lg">
            Accede a tu cuenta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Campo de Correo */}
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tucorreo@institucion.edu"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             transition-all shadow-inner hover:border-indigo-300"
                  required
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-sm
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             transition-all shadow-inner hover:border-indigo-300"
                  required
                />
                {/* Toggle de Contraseña con iconos de Lucide */}
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3 text-base font-semibold
                         text-white shadow-xl shadow-indigo-500/50 hover:from-indigo-700 hover:to-violet-800 focus:outline-none focus:ring-4
                         focus:ring-indigo-300 transition-all duration-300 disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Mensajes de error o éxito con mejor estilo */}
          {message && (
            <div className={`mt-6 p-3 rounded-xl text-sm text-center font-medium transition-all duration-300 ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-red-50 text-red-700 border border-red-300'}`}>
              {message}
            </div>
          )}

          {/* Enlace de recuperación de contraseña */}
          <p className="mt-8 text-center text-sm text-slate-500">
            ¿Olvidaste tu contraseña?{' '}
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              onClick={() => navigate('/forgot-password')}
            >
              Recupérala aquí
            </button>
          </p>
        </div>
      </div>

      {/* Lado derecho: Imagen con degradado sutil */}
      <div className="hidden lg:block bg-gradient-to-tr from-slate-200 to-indigo-100 relative overflow-hidden">
        <div className="flex items-center justify-center h-full p-16">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Ilustración profesional de trabajo colaborativo"
            className="w-full h-auto max-w-xl object-cover rounded-[2rem] shadow-3xl shadow-indigo-400/40 transform hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      </div>
    </main>
  )
}
