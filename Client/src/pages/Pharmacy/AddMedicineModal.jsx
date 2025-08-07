import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddMedicineModal = ({ isOpen, onClose, onAddMedicine }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        manufacturer: '',
        price: '',
        stockQuantity: '',
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        for (const key in formData) {
            if (formData[key] === '') {
                alert(`Please fill in the ${key} field.`);
                return;
            }
        }
        onAddMedicine(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Medicine</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input-style" required />
                        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="input-style" required />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input-style md:col-span-2" rows="3" required></textarea>
                        <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer" className="input-style" required />
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="input-style" required />
                        <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} placeholder="Stock Quantity" className="input-style" required />
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                            Add Medicine
                        </button>
                    </div>
                </form>
            </motion.div>
            <style>{`.input-style { border-width: 1px; border-color: #D1D5DB; --tw-ring-color: #6366F1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100%; padding: 0.5rem 0.75rem; } .input-style:focus { border-color: #4F46E5; ring-width: 1px; }`}</style>
        </div>
    );
};

export default AddMedicineModal;
