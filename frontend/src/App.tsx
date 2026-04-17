import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TPEStock from './pages/tpe/TPEStock';
import TPEMaintenance from './pages/tpe/TPEMaintenance';
import TPEReturns from './pages/tpe/TPEReturns';
import TPETransfers from './pages/tpe/TPETransfers';
import TPEReform from './pages/tpe/TPEReform';
import ChargerStock from './pages/chargers/ChargerStock';
import ChargerTransfers from './pages/chargers/ChargerTransfers';
import CardStock from './pages/cards/CardStock';
import CardCirculation from './pages/cards/CardCirculation';
import CardMonitoring from './pages/cards/CardMonitoring';
import CardTransfers from './pages/cards/CardTransfers';
import UserManagement from './pages/admin/UserManagement';
import StructureManagement from './pages/admin/StructureManagement';
import AuditLogs from './pages/admin/AuditLogs';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Dashboard Layout) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* TPE Module Routes */}
        <Route path="/tpe/stock" element={<ProtectedRoute><TPEStock /></ProtectedRoute>} />
        <Route path="/tpe/maintenance" element={<ProtectedRoute><TPEMaintenance /></ProtectedRoute>} />
        <Route path="/tpe/returns" element={<ProtectedRoute><TPEReturns /></ProtectedRoute>} />
        <Route path="/tpe/transfers" element={<ProtectedRoute><TPETransfers /></ProtectedRoute>} />
        <Route path="/tpe/reform" element={<ProtectedRoute><TPEReform /></ProtectedRoute>} />
        
        {/* Charger/Base Module Routes */}
        <Route path="/chargers/stock" element={<ProtectedRoute><ChargerStock /></ProtectedRoute>} />
        <Route path="/chargers/transfers" element={<ProtectedRoute><ChargerTransfers /></ProtectedRoute>} />
        
        {/* Management Card Module Routes */}
        <Route path="/cards/stock" element={<ProtectedRoute><CardStock /></ProtectedRoute>} />
        <Route path="/cards/circulation" element={<ProtectedRoute><CardCirculation /></ProtectedRoute>} />
        <Route path="/cards/monitoring" element={<ProtectedRoute><CardMonitoring /></ProtectedRoute>} />
        <Route path="/cards/transfers" element={<ProtectedRoute><CardTransfers /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['administrator', 'dpe_member']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/structures" element={<ProtectedRoute allowedRoles={['administrator', 'dpe_member']}><StructureManagement /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['administrator']}><AuditLogs /></ProtectedRoute>} />
      </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
