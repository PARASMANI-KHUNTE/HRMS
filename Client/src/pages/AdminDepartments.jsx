import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding } from 'react-icons/fa';
import api from '../utils/api';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const response = await api.get('/departments/admin/all');
                setDepartments(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch departments. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
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
                    <FaBuilding />
                    Hospital Departments
                </h1>
            </div>

            {loading && <p className="text-center text-gray-500">Loading departments...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {departments.length > 0 ? (
                                departments.map(dept => (
                                    <tr key={dept._id}>
                                        <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-800">{dept.name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap text-gray-600">{new Date(dept.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="py-6 text-center text-gray-500">No departments found for this hospital.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default AdminDepartments;
