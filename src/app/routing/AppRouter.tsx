import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../../shared/components/layout/Layout";
import ProtectedRoute from "../../shared/components/auth/ProtectedRoute";

// 🔹 Páginas institucionales (EXISTENTES)
const PlanWizardPage = lazy(
  () => import("../../features/institutional/pages/PlanWizardPage")
);
const InstitutionPage = lazy(
  () => import("../../features/institutional/pages/InstitutionPage")
);

// 🔹 Páginas de Matrícula (EXISTENTES)
const AdmissionProcessPage = lazy(
  () => import("../../features/enrollment/admission/pages/AdmissionProcessPage")
);
const EnrollmentRegistrationPage = lazy(
  () =>
    import(
      "../../features/admin/pages/enrollment/EnrollmentRegistrationPage"
    )
);
const EnrollmentListPage = lazy(
  () =>
    import(
      "../../features/admin/pages/enrollment/EnrollmentListPage"
    )
);
const EnrollmentModificationPage = lazy(
  () =>
    import(
      "../../features/admin/pages/enrollment/EnrollmentModificationPage"
    )
);


// 🔹 Autenticación (EXISTENTES)
const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("../../features/auth/pages/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(
  () => import("../../features/auth/pages/ResetPasswordPage")
);
const UnauthorizedPage = lazy(
  () => import("../../shared/components/auth/UnauthorizedPage")
);

// 🔹 Portal principal (EXISTENTES)
const MenuPrincipalPage = lazy(
  () => import("../../features/portal/pages/MenuPrincipalPage")
);

// 🔹 Gestión de Usuarios (EXISTENTES)
const UsersPage = lazy(
  () => import("../../features/users/pages/admin/UsersPage")
);
const GestionarUsuariosPage = lazy(
  () => import("../../features/users/pages/admin/GestionarUsuariosPage")
);
const AdminPage = lazy(
  () => import("../../features/users/pages/superadmin/AdminPage")
);
const AdministrarUsuariosPage = lazy(
  () => import("../../features/users/pages/superadmin/AdministrarUsuariosPage")
);

// 🔹 Catálogos (EXISTENTES)
const FacultiesPage = lazy(
  () => import("../../features/admin/pages/faculties/FacultiesSetupPage")
);
// (Programas y Cursos se definen abajo)


// 🔑 --- PÁGINAS DEL DIRECTOR (ADMIN) - DETALLADAS ---
const GeneralSetupPage = lazy(
  () => import("../../features/admin/pages/AcademicSetupPage")
);
const AcademicPeriodsPage = lazy(
  () => import("../../features/admin/pages/periodos/AcademicPeriodsPage")
);
const StudyPlansPage = lazy(
    () => import("../../features/admin/pages/plans/StudyPlansPage")
);
const AdminProgramsPage = lazy(
    () => import("../../features/admin/pages/programs/ProgramsPage")
);
const AdminCoursesPage = lazy(
  () => import("../../features/admin/pages/courses/AdminCoursesPage")
);
const PersonnelManagementPage = lazy(
  () => import("../../features/admin/pages/confusers/PersonnelManagementPage")
);
const SpecializationsPage = lazy(
  () => import("../../features/admin/pages/confusers/SpecializationsPage")
);
const CourseAssignmentPage = lazy(
  () => import("../../features/admin/pages/assignament/CourseAssignmentPage")
);
const EnrollmentProcessPage = lazy(
  () =>
    import(
      "../../features/admin/pages/enrollment/EnrollmentProcessPage"
    )
);

// 💡==========================================================
// 💡 NUEVAS IMPORTACIONES: Docente y Estudiante
// 💡==========================================================
const TeacherClassesPage = lazy(
  () => import("../../features/docente/pages/TeacherClassesPage")
);
const TeacherEvaluationsPage = lazy(
  () => import("../../features/docente/pages/TeacherEvaluationsPage.tsx")
);



// ----------------------------------------------------------------------


export const router = createBrowserRouter([
  // 🔸 Rutas públicas (Originales)
  { path: "/", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // 🔸 Portal principal (Original)
  {
    path: "/menu-principal",
    element: (
      <ProtectedRoute roles={["superadmin", "admin", "docente", "estudiante"]}>
        <MenuPrincipalPage />
      </ProtectedRoute>
    ),
  },

  // 🔸 Rutas internas protegidas con Layout (sidebar reutilizable)
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["superadmin", "admin", "docente", "estudiante"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // 🏛️ --- SUPERADMIN --- (Originales)
      {
        path: "superadmin/institutions",
        element: (
          <ProtectedRoute roles={["superadmin"]}>
            <InstitutionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "superadmin/admins",
        element: (
          <ProtectedRoute roles={["superadmin"]}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "superadmin/administrarusuarios",
        element: (
          <ProtectedRoute roles={["superadmin"]}>
            <AdministrarUsuariosPage />
          </ProtectedRoute>
        ),
      },

      // 🔑 --- DIRECTOR (ADMIN) ---
      {
        path: "admin/academic-setup",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <GeneralSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/academic-setup/periods",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AcademicPeriodsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/academic-setup/plans",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <StudyPlansPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/academic-setup/programs",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminProgramsPage /> 
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/academic-setup/courses",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminCoursesPage /> 
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/academic-setup/faculties",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <FacultiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/personnel-management",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <PersonnelManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/personnel-management/specializations",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <SpecializationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/course-assignment",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <CourseAssignmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/enrollment-process",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <EnrollmentProcessPage />
          </ProtectedRoute>
        ),
      },
      
      // 🧑‍💼 --- RUTAS LEGACY (Admin) ---
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["admin", "superadmin"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios/gestionarusuarios",
        element: (
          <ProtectedRoute roles={["admin", "superadmin"]}>
            <GestionarUsuariosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "catalogos/faculties",
        element: (
          <ProtectedRoute roles={["admin", "superadmin"]}>
            <FacultiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institutional/plan",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <PlanWizardPage />
          </ProtectedRoute>
        ),
      },

      // 🧾 --- MATRÍCULA (Rutas Legacy) ---
      {
        path: "enrollment/admission",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdmissionProcessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/register",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <EnrollmentRegistrationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/list",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <EnrollmentListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/modification",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <EnrollmentModificationPage />
          </ProtectedRoute>
        ),
      },

      // 👨‍🏫 --- DOCENTE ---
      // 💡 CORRECCIÓN: Rutas del Docente añadidas
      {
        path: "teacher/classes",
        element: (
          <ProtectedRoute roles={["docente"]}>
            <TeacherClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "teacher/evaluations",
        element: (
          <ProtectedRoute roles={["docente"]}>
            <TeacherEvaluationsPage />
          </ProtectedRoute>
        ),
      },
      

      // 🎓 --- ESTUDIANTE ---
      // 💡 CORRECCIÓN: Rutas del Estudiante añadidas
      
     
       {
        path: "estudiante/matricula",
        element: (
          <ProtectedRoute roles={["estudiante"]}>
            <EnrollmentListPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

