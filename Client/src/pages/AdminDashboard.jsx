import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCog, FaHospitalAlt, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaUserCog />, path: '/admin' },
  { label: 'Staff', icon: <FaUsers />, path: '/admin/staff' },
  { label: 'Departments', icon: <FaHospitalAlt />, path: '/admin/departments' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <FaUserCog className="text-indigo-600 text-3xl" />
          <span className="font-bold text-xl text-indigo-700 tracking-tight">Admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map(item => (
            <a key={item.label} href={item.path} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
              <span className="text-lg">{item.icon}</span> <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <button className="flex items-center gap-2 mt-8 text-red-500 hover:text-red-700 text-sm font-semibold">
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-indigo-700 mb-2 tracking-tight">Welcome, Admin</h1>
          <p className="text-gray-600 mb-6">Manage staff, departments, and view hospital stats here.</p>
          {/* Quick stats placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-indigo-50 p-6 rounded-lg text-center">
              <span className="block text-2xl font-bold text-indigo-700">--</span>
              <span className="text-gray-500">Staff</span>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg text-center">
              <span className="block text-2xl font-bold text-indigo-700">--</span>
              <span className="text-gray-500">Departments</span>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg text-center">
              <span className="block text-2xl font-bold text-indigo-700">--</span>
              <span className="text-gray-500">Patients</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
