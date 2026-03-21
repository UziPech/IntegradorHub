import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AuthLayout from './features/auth/components/AuthLayout';
import './index.css';

// ─── Lazy-loaded: cada ruta se descarga solo cuando el usuario navega a ella ───
const GroupSelector = lazy(() => import('./features/auth/components/GroupSelector'));
const DashboardLayout = lazy(() => import('./features/dashboard/components/DashboardLayout'));
const RoleGuard = lazy(() => import('./features/auth/components/RoleGuard'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./features/projects/pages/ProjectsPage'));
const TeamPage = lazy(() => import('./features/dashboard/pages/TeamPage'));
const CalendarPage = lazy(() => import('./features/dashboard/pages/CalendarPage'));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'));
const ProjectEditorPage = lazy(() => import('./features/projects/pages/ProjectEditorPage'));
const ShowcasePage = lazy(() => import('./features/public/pages/ShowcasePage'));
const RankingPage = lazy(() => import('./features/public/pages/RankingPage'));
const AdminPanel = lazy(() => import('./features/admin/pages/AdminPanel'));
const MateriasPanel = lazy(() => import('./features/admin/pages/MateriasPanel'));
const StudentsPanel = lazy(() => import('./features/admin/pages/StudentsPanel'));
const TeachersPanel = lazy(() => import('./features/admin/pages/TeachersPanel'));
const CarrerasPanel = lazy(() => import('./features/admin/pages/CarrerasPanel'));
const EvaluationsPage = lazy(() => import('./features/evaluations/pages/EvaluationsPage'));

// ─── Spinner minimalista entre rutas ───
function RouteSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(128,128,128,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// Componente de ruta protegida
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117]">
        <div className="w-8 h-8 border-2 border-gray-400 dark:border-slate-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteSpinner />}>
          <Routes>
            {/* Rutas de Autenticación con fondo 3D persistente */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Layout Principal con Sidebar */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route element={<RoleGuard allowedRoles={['Alumno', 'Docente']} />}>
                <Route path="/team" element={<TeamPage />} />
                <Route path="/evaluations" element={<EvaluationsPage />} />
              </Route>
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Route>

            <Route
              path="/project/:id/editor"
              element={
                <ProtectedRoute>
                  <ProjectEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup"
              element={
                <ProtectedRoute>
                  <GroupSelector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/materias"
              element={
                <ProtectedRoute>
                  <MateriasPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute>
                  <StudentsPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute>
                  <TeachersPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/carreras"
              element={
                <ProtectedRoute>
                  <CarrerasPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
