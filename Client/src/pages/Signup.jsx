import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FaUserPlus } from 'react-icons/fa';

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
});

export default function Signup() {
  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-200"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <FaUserPlus className="text-5xl text-indigo-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-indigo-700">Sign Up</h2>
        <p className="text-gray-500 mb-6">Create your account</p>
        <Formik
          initialValues={{ firstName: '', lastName: '', email: '', phone: '', password: '' }}
          validationSchema={SignupSchema}
          onSubmit={(values) => {
            // TODO: handle signup API
            alert(JSON.stringify(values, null, 2));
          }}
        >
          {() => (
            <Form className="w-full flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Field name="firstName" placeholder="First Name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="w-1/2">
                  <Field name="lastName" placeholder="Last Name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
              <div>
                <Field name="email" type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <Field name="phone" placeholder="Phone" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <Field name="password" type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold">Sign Up</button>
            </Form>
          )}
        </Formik>
        <div className="flex justify-between w-full mt-4 text-sm">
          <Link to="/login" className="text-indigo-500 hover:underline">Already have an account?</Link>
        </div>
      </div>
    </motion.div>
  );
}
