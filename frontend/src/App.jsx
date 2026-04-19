import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import { getCurrentUser } from './utils/auth';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Logs from './pages/Logs';
import Database from './pages/Database';
import Alerts from './pages/Alerts';
import Parking from './pages/Parking';
import Settings from './pages/Settings';

// Dashboard Pages (Placeholders for upcoming components)
import LiveMonitor from './pages/LiveMonitor';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Routes - Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="live" element={<LiveMonitor />} />
          <Route path="logs" element={<Logs />} />
          <Route path="database" element={<Database />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="parking" element={<Parking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
