import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import SuperadminHospitals from "./pages/SuperadminHospitals";
import SuperadminAdmins from "./pages/SuperadminAdmins";
import SuperadminDepartments from "./pages/SuperadminDepartments";
import SuperadminStaff from "./pages/SuperadminStaff";
import SuperadminPatients from "./pages/SuperadminPatients";
import SuperadminInvoices from "./pages/SuperadminInvoices";
import SuperadminPayments from "./pages/SuperadminPayments";
import SuperadminReports from "./pages/SuperadminReports";
import SuperadminSettings from "./pages/SuperadminSettings";
import SuperadminAuditLogs from "./pages/SuperadminAuditLogs";
import AdminDashboard from "./pages/AdminDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import LabDashboard from "./pages/LabDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirector from './components/AuthRedirector';

function App() {
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AuthRedirector>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperadminDashboard />}>
              <Route index element={
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h1 className="text-3xl font-bold text-indigo-700 mb-2 tracking-tight">Welcome, Superadmin</h1>
                  <p className="text-gray-600 mb-6">Manage hospitals, admins, and view system stats here.</p>
                  {/* Quick stats placeholder */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-indigo-50 p-6 rounded-lg text-center">
                      <span className="block text-2xl font-bold text-indigo-700">--</span>
                      <span className="text-gray-500">Hospitals</span>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-lg text-center">
                      <span className="block text-2xl font-bold text-indigo-700">--</span>
                      <span className="text-gray-500">Admins</span>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-lg text-center">
                      <span className="block text-2xl font-bold text-indigo-700">--</span>
                      <span className="text-gray-500">Staff</span>
                    </div>
                  </div>
                </div>
              } />
              <Route path="hospitals" element={<SuperadminHospitals />} />
              <Route path="admins" element={<SuperadminAdmins />} />
              <Route path="departments" element={<SuperadminDepartments />} />
              <Route path="staff" element={<SuperadminStaff />} />
              <Route path="patients" element={<SuperadminPatients />} />
                            <Route path="invoices" element={<SuperadminInvoices />} />
              <Route path="payments" element={<SuperadminPayments />} />
              <Route path="reports" element={<SuperadminReports />} />
              <Route path="settings" element={<SuperadminSettings />} />
              <Route path="audit-logs" element={<SuperadminAuditLogs />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
            <Route path="/receptionist/*" element={<ReceptionistDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['lab']} />}>
            <Route path="/lab/*" element={<LabDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
            <Route path="/pharmacist/*" element={<PharmacistDashboard />} />
          </Route>
          {/* Add role-based panels here as you build them */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthRedirector>
    </Router>
  );
}

export default App;
