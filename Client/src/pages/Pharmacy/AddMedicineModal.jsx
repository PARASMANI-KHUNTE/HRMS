import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const AddMedicineModal = ({ isOpen, onClose, onAddMedicine }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        manufacturer: '',
        purchasePrice: '',
        salePrice: '',
        quantity: '',
        availableQuantity: '',
        genericName: '',
        effects: '',
        storeBox: '',
        expiryDate: '',
        batchNumber: '',
        free: '',
        cgst: '',
        sgst: '',
        igst: '',
        hsnCode: '',
    });
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const { data } = await api.get('/pharmacy/categories?limit=100&page=1');
                setCategories(data.categories || []);
            } catch (e) {
                // silent fail; user can still type category manually if needed
                console.error('Failed to load categories', e);
            } finally {
                setLoadingCategories(false);
            }
        };
        if (isOpen) loadCategories();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation for required fields
        const required = ['name', 'category', 'manufacturer'];
        for (const key of required) {
            if (!formData[key]) {
                alert(`Please fill in the ${key} field.`);
                return;
            }
        }

        const toNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
        const payload = {
            name: formData.name,
            category: formData.category,
            manufacturer: formData.manufacturer,
            purchasePrice: toNumber(formData.purchasePrice),
            salePrice: toNumber(formData.salePrice),
            quantity: toNumber(formData.quantity),
            availableQuantity: toNumber(formData.availableQuantity),
            genericName: formData.genericName,
            effects: formData.effects,
            storeBox: formData.storeBox,
            expiryDate: formData.expiryDate || undefined,
            batchNumber: formData.batchNumber,
            free: toNumber(formData.free),
            cgst: toNumber(formData.cgst),
            sgst: toNumber(formData.sgst),
            igst: toNumber(formData.igst),
            hsnCode: formData.hsnCode,
        };
        onAddMedicine(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">Add New Medicine</h2>
                        <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700 text-xl">×</button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input-style" required />
                        <select name="category" value={formData.category} onChange={handleChange} className="input-style" required>
                            <option value="" disabled>{loadingCategories ? 'Loading categories...' : (categories.length ? 'Choose Category' : 'No categories found')}</option>
                            {categories.map((c)=> (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <input type="text" name="genericName" value={formData.genericName} onChange={handleChange} placeholder="Generic Name" className="input-style" />
                        <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer" className="input-style" required />
                        <input type="text" name="effects" value={formData.effects} onChange={handleChange} placeholder="Effects" className="input-style" />
                        <input type="text" name="storeBox" value={formData.storeBox} onChange={handleChange} placeholder="Store Box" className="input-style" />

                        <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} placeholder="Purchase Price" className="input-style" step="0.01" />
                        <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="Sale Price" className="input-style" step="0.01" />

                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" className="input-style" />
                        <input type="number" name="availableQuantity" value={formData.availableQuantity} onChange={handleChange} placeholder="Available Quantity" className="input-style" />
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="Expire date" className="input-style" />
                        <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" className="input-style" />
                        <input type="number" name="free" value={formData.free} onChange={handleChange} placeholder="Free" className="input-style" />
                        <input type="number" name="cgst" value={formData.cgst} onChange={handleChange} placeholder="CGST (%)" className="input-style" step="0.01" />
                        <input type="number" name="sgst" value={formData.sgst} onChange={handleChange} placeholder="SGST (%)" className="input-style" step="0.01" />
                        <input type="number" name="igst" value={formData.igst} onChange={handleChange} placeholder="IGST (%)" className="input-style" step="0.01" />
                        <input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleChange} placeholder="HSN Code" className="input-style" />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
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
