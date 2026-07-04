import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ChangePassword from './pages/auth/ChangePassword';
import Dashboard from './pages/employees/Dashboard';
import AddEmployee from './pages/employees/AddEmployee';
import Profile from './pages/profile/Profile';
import AttendanceAdminView from './pages/attendance/AdminView';
import AttendanceEmployeeView from './pages/attendance/EmployeeView';
import TimeOffAdminView from './pages/timeoff/AdminView';
import TimeOffEmployeeView from './pages/timeoff/EmployeeView';

function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin' || user.role === 'hr';
  return isAdmin ? <AttendanceAdminView /> : <AttendanceEmployeeView />;
}

function TimeOffPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin' || user.role === 'hr';
  return isAdmin ? <TimeOffAdminView /> : <TimeOffEmployeeView />;
}

function EmployeeRoute() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin' || user.role === 'hr';
  if (!isAdmin) return <Navigate to="/profile" replace />;
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/add"
        element={
          <ProtectedRoute>
            <AddEmployee />
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
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timeoff"
        element={
          <ProtectedRoute>
            <TimeOffPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}
