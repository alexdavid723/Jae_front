import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../../shared/components/layout/Layout";
import ProtectedRoute from "../../shared/components/auth/ProtectedRoute";

// 🔹 Páginas institucionales
const PlanWizardPage = lazy(() =>
  import("../../features/institutional/plan-management/pages/PlanWizardPage")
);

// 🔹 Páginas de Matrícula
const AdmissionProcessPage = lazy(() =>
  import("../../features/enrollment/admission/pages/AdmissionProcessPage")
);
const EnrollmentRegistrationPage = lazy(() =>
  import("../../features/enrollment/enrollmentprocess/pages/EnrollmentRegistrationPage")
);
const EnrollmentListPage = lazy(() =>
  import("../../features/enrollment/enrollmentprocess/pages/EnrollmentListPage")
);
const EnrollmentModificationPage = lazy(() =>
  import("../../features/enrollment/enrollmentprocess/pages/EnrollmentModificationPage")
);

// 🔹 Páginas de autenticación y portal
const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(() =>
  import("../../features/auth/pages/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() =>
  import("../../features/auth/pages/ResetPasswordPage")
);
const MenuPrincipalPage = lazy(() =>
  import("../../features/portal/pages/MenuPrincipalPage")
);
const UnauthorizedPage = lazy(() =>
  import("../../shared/components/auth/UnauthorizedPage")
);

// 🔹 Páginas de Usuarios
const UsersPage = lazy(() => import("../../features/users/pages/UsersPage"));
const GestionarUsuariosPage = lazy(() =>
  import("../../features/users/pages/GestionarUsuariosPage")
);

export const router = createBrowserRouter([
  // 🔸 Rutas públicas (auth)
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  // 🔸 Portal principal protegido
  {
    path: "/menu-principal",
    element: (
      <ProtectedRoute roles={["administrador", "estudiante", "docente"]}>
        <MenuPrincipalPage />
      </ProtectedRoute>
    ),
  },

  // 🔸 Rutas internas con Layout (usa Sidebar y Topbar)
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["administrador", "estudiante", "docente"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // 🔹 Gestión Institucional
      {
        path: "institutional/plan",
        element: (
          <ProtectedRoute roles={["administrador"]}>
            <PlanWizardPage />
          </ProtectedRoute>
        ),
      },

      // 🔹 Matrícula
      {
        path: "enrollment/admission",
        element: (
          <ProtectedRoute roles={["administrador"]}>
            <AdmissionProcessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/register",
        element: (
          <ProtectedRoute roles={["administrador"]}>
            <EnrollmentRegistrationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/list",
        element: (
          <ProtectedRoute roles={["administrador"]}>
            <EnrollmentListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/modification",
        element: (
          <ProtectedRoute roles={["administrador"]}>
            <EnrollmentModificationPage />
          </ProtectedRoute>
        ),
      },

      // 🔹 Gestión de Usuarios
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["administrador", "superadmin"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios/gestionarusuarios",
        element: (
          <ProtectedRoute roles={["administrador", "superadmin"]}>
            <GestionarUsuariosPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
