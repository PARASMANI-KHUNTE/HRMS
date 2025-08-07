import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPills, FaCapsules, FaSignOutAlt, FaFileInvoiceDollar, FaHistory, FaUndoAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaPills />, path: '/pharmacist' },
  { label: 'Inventory', icon: <FaCapsules />, path: '/pharmacist/inventory' },
  { label: 'Billing', icon: <FaFileInvoiceDollar />, path: '/pharmacist/billing' },
  { label: 'Invoices', icon: <FaHistory />, path: '/pharmacist/invoices' },
  { label: 'Returns', icon: <FaUndoAlt />, path: '/pharmacist/returns' },
];

const DashboardHome = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-xl shadow-lg p-8"
  >
    <h1 className="text-3xl font-bold text-indigo-700 mb-2 tracking-tight">Welcome, Pharmacist</h1>
    <p className="text-gray-600 mb-6">Manage pharmacy inventory and billing here.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-indigo-50 p-6 rounded-lg text-center">
        <span className="block text-2xl font-bold text-indigo-700">--</span>
        <span className="text-gray-500">Inventory Items</span>
      </div>
      <div className="bg-indigo-50 p-6 rounded-lg text-center">
        <span className="block text-2xl font-bold text-indigo-700">--</span>
        <span className="text-gray-500">Today's Sales</span>
      </div>
    </div>
  </motion.div>
);

export default function PharmacistDashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <FaPills className="text-indigo-600 text-3xl" />
          <span className="font-bold text-xl text-indigo-700 tracking-tight">Pharmacist</span>
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium ${location.pathname === item.path
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button className="flex items-center gap-2 mt-8 text-red-500 hover:text-red-700 text-sm font-semibold">
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      <main className="flex-1 p-10">
        {location.pathname === '/pharmacist' ? <DashboardHome /> : <Outlet />}
      </main>
    </div>
  );
}
