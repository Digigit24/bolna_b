import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calls from './pages/Calls';
import Candidates from './pages/Candidates';
import Health from './pages/Health';
import Interviews from './pages/Interviews';
import Jobs from './pages/Jobs';
import Organizations from './pages/Organizations';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="calls" element={<Calls />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="health" element={<Health />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
