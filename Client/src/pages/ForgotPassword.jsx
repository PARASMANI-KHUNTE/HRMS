import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ResetSchema = Yup.object().shape({
  otp: Yup.string().required('Required').matches(/^[0-9]{6}$/, 'Must be a 6-digit number'),
  newPassword: Yup.string().required('Required').min(6, 'Password must be at least 6 characters'),
});

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  if (!emailSent) {
    return (
      <motion.div
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-blue-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
      >
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
          <FaKey className="text-5xl text-indigo-400 mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-indigo-700 tracking-tight">Forgot Password</h2>
          <p className="text-gray-500 mb-6">Enter your email to receive password reset instructions</p>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const { data } = await (await import('../utils/api')).default.post('/auth/forgot-password', values);
                toast.success(data.message || 'OTP sent to your email!');
                setEmail(values.email);
                setEmailSent(true);
              } catch (err) {
                toast.error((err.response?.data?.message) || 'Failed to send OTP. Please check your email or server logs.');
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold transition-all ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </button>
              </Form>
            )}
          </Formik>
          <div className="flex justify-between w-full mt-4 text-sm">
            <Link to="/login" className="text-indigo-500 hover:underline">Back to login</Link>
          </div>
        </div>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-teal-100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2 text-teal-700">Enter OTP</h2>
          <p className="text-gray-500 mb-6">An OTP has been sent to {email}</p>
          <Formik
            initialValues={{ otp: '', newPassword: '' }}
            validationSchema={ResetSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const { data } = await (await import('../utils/api')).default.post('/auth/reset-password', { ...values, email });
                toast.success(data.message || 'Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                  navigate('/login');
                }, 2000); // Redirect after 2 seconds
              } catch (err) {
                toast.error((err.response?.data?.message) || 'Failed to reset password.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="w-full flex flex-col gap-6">
                <div>
                  <Field name="otp" type="text" placeholder="6-Digit OTP" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
                  <ErrorMessage name="otp" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <Field name="newPassword" type="password" placeholder="New Password" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
                  <ErrorMessage name="newPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 bg-teal-600 text-white rounded-lg font-semibold transition-all ${isSubmitting ? 'opacity-60' : 'hover:bg-teal-700'}`}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    );
  }
}
