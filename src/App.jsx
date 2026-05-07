import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import EnrollmentForm from './pages/EnrollmentForm';
import LeadDetail from './pages/LeadDetail';
import Assessment from './pages/Assessment';
import PaymentEntry from './pages/PaymentEntry';
import PartnerList from './pages/PartnerList';
import PartnerForm from './pages/PartnerForm';
import PartnerDetail from './pages/PartnerDetail';
import PayoutDashboard from './pages/PayoutDashboard';
import CohortList from './pages/CohortList';
import CohortForm from './pages/CohortForm';
import CohortDetail from './pages/CohortDetail';
import Users from './pages/Users';
import PublicRegister from './pages/PublicRegister';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/assess/:lead_id" element={<Assessment />} />
      <Route path="/register" element={<PublicRegister />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<LeadList />} />
        <Route path="enrollment" element={<EnrollmentForm />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="leads/:id/payment/new" element={<PaymentEntry />} />
        <Route path="partners" element={<PartnerList />} />
        <Route path="partners/new" element={<PartnerForm />} />
        <Route path="partners/:id" element={<PartnerDetail />} />
        <Route path="payouts" element={<PayoutDashboard />} />
        <Route path="cohorts" element={<CohortList />} />
        <Route path="cohorts/new" element={<CohortForm />} />
        <Route path="cohorts/:id" element={<CohortDetail />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '14px' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
