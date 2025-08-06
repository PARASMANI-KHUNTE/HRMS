import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-16 h-16 text-indigo-500 mb-2"><g><rect width="48" height="48" rx="12" fill="#6366f1"/><path d="M24 13a2 2 0 0 1 2 2v7h7a2 2 0 1 1 0 4h-7v7a2 2 0 1 1-4 0v-7h-7a2 2 0 1 1 0-4h7v-7a2 2 0 0 1 2-2z" fill="#fff"/></g></svg>
        <h1 className="text-5xl font-bold text-indigo-700 mb-2 drop-shadow-lg tracking-tight">HRMS Hospital Suite</h1>
      </div>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        Modern, secure, and beautiful hospital management for all roles. <br />
        Manage hospitals, staff, patients, pharmacy, lab, and more from one platform.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all text-lg font-semibold"
        >
          Login
        </button>
      </div>
      <footer className="mt-12 text-gray-400 text-xs text-center w-full">
        <span>&copy; {new Date().getFullYear()} Akkura IT Services &mdash; HRMS Hospital Suite. All rights reserved.</span>
      </footer>
    </motion.div>
  );
}
