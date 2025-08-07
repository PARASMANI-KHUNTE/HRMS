import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus } from 'react-icons/fi';
import api from '../utils/api'; // Ensure you have this api utility

const AdminStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoading(true);
                // This endpoint should be protected and return staff for the admin's hospital
                const response = await api.get('/staff/admin/all');
                setStaff(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch staff. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">Staff Management</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    <FiPlus /> Add Staff
                </button>
            </div>

            {loading && <p className="text-center text-gray-500">Loading staff...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {staff.length > 0 ? (
                                staff.map(member => (
                                    <tr key={member._id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{`${member.firstName} ${member.lastName}`}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.email}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.phone}</td>
                                        <td className="py-4 px-6 whitespace-nowrap capitalize">{member.role}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.departmentId?.name || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-6 text-center text-gray-500">No staff members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default AdminStaff;

