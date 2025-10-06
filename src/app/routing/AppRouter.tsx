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

// 🔹 Páginas de auth y portal
const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../../features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../../features/auth/pages/ResetPasswordPage"));
const MenuPrincipalPage = lazy(() => import("../../features/portal/pages/MenuPrincipalPage"));
const UnauthorizedPage = lazy(() => import("../../shared/components/auth/UnauthorizedPage"));

export const router = createBrowserRouter([
  // Login y auth
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
  // Portal principal
  {
    path: "/menu-principal",
    element: (
      <ProtectedRoute roles={["administrador", "estudiante", "docente"]}>
        <MenuPrincipalPage />
      </ProtectedRoute>
    ),
  },
  // Unauthorized
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  // Rutas internas con Layout
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["administrador", "estudiante", "docente"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "institutional/plan", element: <ProtectedRoute roles={["administrador"]}><PlanWizardPage /></ProtectedRoute> },
      { path: "enrollment/admission", element: <ProtectedRoute roles={["administrador"]}><AdmissionProcessPage /></ProtectedRoute> },
      { path: "enrollment/register", element: <ProtectedRoute roles={["administrador"]}><EnrollmentRegistrationPage /></ProtectedRoute> },
      { path: "enrollment/list", element: <ProtectedRoute roles={["administrador"]}><EnrollmentListPage /></ProtectedRoute> },
      { path: "enrollment/modification", element: <ProtectedRoute roles={["administrador"]}><EnrollmentModificationPage /></ProtectedRoute> },
      // Aquí podrías agregar rutas para estudiantes y docentes
    ],
  },
]);
