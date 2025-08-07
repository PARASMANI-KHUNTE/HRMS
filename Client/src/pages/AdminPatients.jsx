import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserInjured } from 'react-icons/fa';
import api from '../utils/api';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await api.get('/reception/patient/getall');
                setPatients(response.data.patients);
                setError(null);
            } catch (err) {
                setError('Failed to fetch patients. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-700 tracking-tight flex items-center gap-3">
                    <FaUserInjured />
                    Hospital Patients
                </h1>
            </div>

            {loading && <p className="text-center text-gray-500">Loading patients...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {patients.length > 0 ? (
                                patients.map(patient => (
                                    <tr key={patient._id}>
                                        <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-800">{`${patient.firstName} ${patient.lastName}`}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-600">{patient.email}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-600">{patient.phone}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-600">{patient.gender}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-600">{new Date(patient.dob).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-6 text-center text-gray-500">No patients found for this hospital.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default AdminPatients;
