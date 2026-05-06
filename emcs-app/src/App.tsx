import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData.tsx';
import MRP from './pages/MRP.tsx';
import ApprovalInbox from './pages/ApprovalInbox.tsx';
import Admin from './pages/Admin.tsx';
import InventoryTransaction from './pages/InventoryTransaction.tsx';
import Placeholder from './pages/Placeholder.tsx';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="mrp" element={<MRP />} />
        <Route path="approval" element={<ApprovalInbox />} />
        <Route path="admin" element={<Admin />} />
        {/* Inventory Management — Phase 2 Placeholders */}
        <Route path="inventory/grpo" element={<InventoryTransaction />} />
        <Route path="inventory/gr" element={<InventoryTransaction />} />
        <Route path="inventory/gi" element={<InventoryTransaction />} />
        <Route path="inventory/transfer" element={<InventoryTransaction />} />
        <Route path="inventory/sas" element={<InventoryTransaction />} />
        {/* Reports — Phase 2 Placeholders */}
        <Route path="reports/inventory" element={<Placeholder title="Inventory Report" description="Comprehensive inventory reports with Power BI embed integration and PDF/Excel export." />} />
        <Route path="reports/procurement" element={<Placeholder title="Procurement Report" description="SPBJ monitoring, procurement trend analysis, and vendor performance scoring." />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
