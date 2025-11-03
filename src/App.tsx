// src/App.tsx
import { RouterProvider } from 'react-router-dom'
import { ClickToComponent } from 'click-to-react-component'
import { Suspense } from 'react'
import { router } from './app/routing/AppRouter'

function App() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <ClickToComponent />
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App