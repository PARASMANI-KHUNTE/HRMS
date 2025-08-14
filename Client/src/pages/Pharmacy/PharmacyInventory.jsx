import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AddMedicineModal from './AddMedicineModal';
import EditMedicineModal from './EditMedicineModal';

const PharmacyInventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/pharmacy/medicines?page=${page}&limit=10&search=${searchTerm}`);
            setMedicines(res.data.medicines);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch medicines.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
        fetchMedicines();
    };

    const handleAddMedicine = async (medicineData) => {
        try {
            await api.post('/pharmacy/medicines', medicineData);
            toast.success('Medicine added successfully!');
            setIsAddModalOpen(false);
            fetchMedicines(); // Refresh the list
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add medicine.';
            toast.error(errorMessage);
            console.error(error);
        }
    };

    const handleEditMedicine = async (id, medicineData) => {
        try {
            await api.put(`/pharmacy/medicines/${id}`, medicineData);
            toast.success('Medicine updated successfully!');
            setIsEditModalOpen(false);
            fetchMedicines(); // Refresh the list
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update medicine.';
            toast.error(errorMessage);
            console.error(error);
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await api.delete(`/pharmacy/medicines/${id}`);
                toast.success('Medicine deleted successfully!');
                fetchMedicines(); // Refresh the list
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Failed to delete medicine.';
                toast.error(errorMessage);
                console.error(error);
            }
        }
    };

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setIsEditModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    <FaPlus /> Add Medicine
                </button>
            </div>

            <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, category..."
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                />
                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900">
                    <FaSearch /> Search
                </button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicines.map((med) => (
                                <tr key={med._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.stockQuantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{med.unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(med)} className="text-indigo-600 hover:text-indigo-900 mr-4"><FaEdit /></button>
                                        <button onClick={() => handleDeleteMedicine(med._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <AddMedicineModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddMedicine={handleAddMedicine}
            />

            {selectedMedicine && (
                <EditMedicineModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onEditMedicine={handleEditMedicine}
                    medicine={selectedMedicine}
                />
            )}
        </motion.div>
    );
};

export default PharmacyInventory;

