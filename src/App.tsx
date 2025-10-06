// src/App.tsx
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import { router } from './app/routing/AppRouter'

function App() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App