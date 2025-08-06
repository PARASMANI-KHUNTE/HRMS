import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FaHospitalAlt } from 'react-icons/fa';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import api from '../utils/api';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
});

import { useDispatch } from 'react-redux';
import { login as loginAction } from '../store/slices/authSlice';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-100 to-blue-200"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <FaHospitalAlt className="text-5xl text-indigo-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-indigo-700 tracking-tight">Login</h2>
        <p className="text-gray-500 mb-6">Sign in to your account</p>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              const { data } = await api.post('/auth/login', values);
              if (data.token) {
                localStorage.setItem('token', data.token);
                let decoded = null;
                try {
                  decoded = jwtDecode(data.token);
                } catch (error) {
                  console.error('Failed to decode token:', error);
                  toast.error('Invalid session token.');
                  return;
                }

                if (!decoded || !decoded.user) {
                  toast.error('Invalid token structure.');
                  return;
                }
                
                dispatch(loginAction({ token: data.token, user: decoded.user }));
                toast.success('Login successful!');
              } else {
                toast.info('Login successful, but no token received.');
              }
            } catch (err) {
              console.error('LOGIN SUBMIT ERROR:', err);
              if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
              } else if (err.request) {
                toast.error('Login failed: No response from server. Is it running?');
              } else {
                toast.error(`Login failed: ${err.message}`);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="w-full flex flex-col gap-6">
              <div>
                <Field name="email" type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="relative">
                <Field name="password">
                  {({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base pr-12"
                    />
                  )}
                </Field>
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold transition-all ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        <div className="flex justify-between w-full mt-4 text-sm">
          <Link to="/forgot-password" className="text-indigo-500 hover:underline">Forgot password?</Link>
        </div>
        <footer className="mt-8 text-gray-400 text-xs text-center w-full">
          <span>&copy; {new Date().getFullYear()} Akkura IT Services &mdash; HRMS Hospital Suite. All rights reserved.</span>
        </footer>
      </div>
    </motion.div>
  );
}
