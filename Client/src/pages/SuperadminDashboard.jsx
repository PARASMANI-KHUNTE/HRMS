import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaHospitalAlt, FaUsers, FaSignOutAlt, FaBuilding, FaUserMd, FaUserInjured, FaFileInvoiceDollar, FaChartBar, FaCog, FaChevronLeft, FaHistory } from 'react-icons/fa';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
const StatCard = ({ icon, title, value, linkTo }) => (
  <Link to={linkTo} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 flex items-center gap-4">
    <div className="bg-indigo-100 p-4 rounded-full">
      {React.cloneElement(icon, { className: 'text-indigo-600 text-3xl' })}
    </div>
    <div>
      <h3 className="text-gray-500 font-semibold text-lg">{title}</h3>
      <p className="text-4xl font-bold text-gray-800">{value}</p>
    </div>
  </Link>
);

const DashboardHome = ({ stats }) => (
  <div>
    <h1 className="text-4xl font-bold text-indigo-800 mb-8">Welcome, Superadmin!</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard icon={<FaHospitalAlt />} title="Total Hospitals" value={stats.hospitals} linkTo="/superadmin/hospitals" />
      <StatCard icon={<FaUserShield />} title="Total Admins" value={stats.admins} linkTo="/superadmin/admins" />
      <StatCard icon={<FaUserMd />} title="Total Staff" value={stats.staff} linkTo="/superadmin/staff" />
      <StatCard icon={<FaUserInjured />} title="Total Patients" value={stats.patients} linkTo="/superadmin/patients" />
    </div>
  </div>
);

const navItems = [
  { label: 'Dashboard', icon: <FaUserShield />, path: '/superadmin' },
  { label: 'Hospitals', icon: <FaHospitalAlt />, path: '/superadmin/hospitals' },
  { label: 'Admins', icon: <FaUsers />, path: '/superadmin/admins' },
  { label: 'Departments', icon: <FaBuilding />, path: '/superadmin/departments' },
  { label: 'Staff', icon: <FaUserMd />, path: '/superadmin/staff' },
  { label: 'Patients', icon: <FaUserInjured />, path: '/superadmin/patients' },
    { label: 'Invoices', icon: <FaFileInvoiceDollar />, path: '/superadmin/invoices' },
  { label: 'Payments', icon: <FaFileInvoiceDollar />, path: '/superadmin/payments' },
  { label: 'Reports', icon: <FaChartBar />, path: '/superadmin/reports' },
  { label: 'Settings', icon: <FaCog />, path: '/superadmin/settings' },
  { label: 'Audit Logs', icon: <FaHistory />, path: '/superadmin/audit-logs' },
];

export default function SuperadminDashboard() {
  const [stats, setStats] = useState({ hospitals: 0, admins: 0, staff: 0, patients: 0 });
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

    useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics.');
        // Set stats to 0 on error to avoid undefined values
        setStats({ hospitals: 0, admins: 0, staff: 0, patients: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100 to-blue-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '5rem' : '16rem' }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-lg flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && <span className="font-bold text-xl text-indigo-700 tracking-tight">Superadmin</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-indigo-50">
            <FaChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 p-2">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all group relative ${location.pathname.startsWith(item.path) && item.path !== '/superadmin' ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''} ${location.pathname === '/superadmin' && item.path === '/superadmin' ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-sm bg-indigo-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all group relative">
            <FaSignOutAlt />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 text-sm bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Logout
              </span>
            )}
          </button>
        </div>
      </motion.aside>
      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {location.pathname === '/superadmin' ? <DashboardHome stats={stats} /> : <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
