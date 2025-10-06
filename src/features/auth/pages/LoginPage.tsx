// src/features/auth/pages/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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
    <main className="grid lg:grid-cols-2 min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50">
      {/* Lado izquierdo: formulario */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido</h1>
          <p className="text-slate-500 mb-8">Accede a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tucorreo@institucion.edu"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500
                           transition-shadow"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500
                             transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-sky-600"
                >
                  {showPwd ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold
                         text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2
                         focus:ring-sky-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Mensajes de error o éxito */}
          {message && (
            <p className={`mt-4 text-center text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Enlace de recuperación de contraseña */}
          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Olvidaste tu contraseña?{' '}
            <button
              type="button"
              className="font-medium text-sky-600 hover:text-sky-700"
              onClick={() => navigate('/forgot-password')}
            >
              Recupérala aquí
            </button>
          </p>
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
  )
}
