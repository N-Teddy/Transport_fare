import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { Toast } from './components/ui/Toast';
import LoginPage from './page/LoginPage';
import { QueryProvider } from './providers/QueryProvider';
import DashboardPage from './page/DashboardPage';
import ResetPasswordPage from './page/ResetPasswordPage';
import RegisterPage from './page/RegisterPage';
import ForgotPasswordPage from './page/ForgotPasswordPage';
import DocumentManagement from './page/DocumentManagement';
import { NotificationProvider } from './context/NotificationContext';
import TripManagement from './page/TripManagement';
import TripManagementLayout from './page/TripManagement';
import UserManagement from './page/UserManagement';
import Profile from './page/Profile';
import VehicleManagement from './page/VehicleManagement';
import GeographyManagement from './page/GeographyManagement';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <QueryProvider>
      <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toast />
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DocumentManagement />
                  </ProtectedRoute>
                }
                />

                <Route
                path="/trip"
                element={
                  <ProtectedRoute>
                    <TripManagementLayout />
                  </ProtectedRoute>
                }
                />

                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/vehicle"
                  element={
                    <ProtectedRoute>
                      <VehicleManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/geography"
                  element={
                    <ProtectedRoute>
                      <GeographyManagement />
                    </ProtectedRoute>
                  }
                />

              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
        </AuthProvider>
      </NotificationProvider>
    </QueryProvider>
  );
}

export default App;
