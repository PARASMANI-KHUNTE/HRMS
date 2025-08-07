import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUndo } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PharmacyReturns = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [foundInvoice, setFoundInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [itemsToReturn, setItemsToReturn] = useState({}); // { medicineId: quantity, ... }

    const totalRefundAmount = Object.entries(itemsToReturn).reduce((acc, [medId, quantity]) => {
        const item = foundInvoice?.items.find(i => i.medicineId._id === medId);
        return acc + (item ? item.price * quantity : 0);
    }, 0);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!invoiceId) {
            toast.error('Please enter an Invoice ID.');
            return;
        }
        setLoading(true);
        setFoundInvoice(null);
        try {
            const { data } = await api.get(`/pharmacy/invoices/${invoiceId}`);
            setFoundInvoice(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invoice not found.');
            setFoundInvoice(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnSelectionChange = (medId, isChecked, originalQuantity) => {
        setItemsToReturn(prev => {
            const newItems = { ...prev };
            if (isChecked) {
                newItems[medId] = 1; // Default to returning 1
            } else {
                delete newItems[medId];
            }
            return newItems;
        });
    };

    const handleReturnQuantityChange = (medId, newQuantity, maxQuantity) => {
        const quantity = Math.max(1, Math.min(parseInt(newQuantity, 10) || 1, maxQuantity));
        setItemsToReturn(prev => ({ ...prev, [medId]: quantity }));
    };

    const handleProcessReturn = async () => {
        if (Object.keys(itemsToReturn).length === 0) {
            toast.error('Please select at least one item to return.');
            return;
        }

        const returnData = {
            invoiceId: foundInvoice._id,
            returnedItems: Object.entries(itemsToReturn).map(([medicineId, quantity]) => ({ medicineId, quantity })),
            refundAmount: totalRefundAmount,
        };

        try {
            await api.post('/pharmacy/returns', returnData);
            toast.success('Return processed successfully!');
            setFoundInvoice(null);
            setItemsToReturn({});
            setInvoiceId('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process return.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
        >
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Process Returns</h1>

            <form onSubmit={handleSearch} className="mb-8 max-w-lg mx-auto bg-gray-50 p-6 rounded-lg shadow">
                <label htmlFor="invoiceId" className="block text-lg font-medium text-gray-700 mb-2">Enter Invoice ID</label>
                <div className="flex gap-2">
                    <input
                        id="invoiceId"
                        type="text"
                        value={invoiceId}
                        onChange={(e) => setInvoiceId(e.target.value)}
                        placeholder="e.g., 60c72b2f9b1d8c001f8e4c6d"
                        className="input-style flex-grow"
                    />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Searching...' : <><FaSearch className="mr-2" /> Search</>}
                    </button>
                </div>
            </form>

            {foundInvoice && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t pt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice Details</h2>
                    <div className="bg-indigo-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div><strong>Patient:</strong> {foundInvoice.patientId.name}</div>
                        <div><strong>Invoice ID:</strong> {foundInvoice._id}</div>
                        <div><strong>Date:</strong> {format(new Date(foundInvoice.createdAt), 'PPpp')}</div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2">Items</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-style w-12">Return?</th>
                                    <th className="th-style">Medicine</th>
                                    <th className="th-style">Qty Purchased</th>
                                    <th className="th-style">Qty to Return</th>
                                    <th className="th-style">Price</th>
                                    <th className="th-style">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {foundInvoice.items.map(item => (
                                    <tr key={item.medicineId._id} className={itemsToReturn[item.medicineId._id] ? 'bg-green-50' : ''}>
                                        <td className="td-style text-center">
                                            <input 
                                                type="checkbox" 
                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={!!itemsToReturn[item.medicineId._id]}
                                                onChange={(e) => handleReturnSelectionChange(item.medicineId._id, e.target.checked, item.quantity)}
                                            />
                                        </td>
                                        <td className="td-style font-medium">{item.medicineId.name}</td>
                                        <td className="td-style text-center">{item.quantity}</td>
                                        <td className="td-style">
                                            <input 
                                                type="number"
                                                className="input-style w-24 text-center"
                                                value={itemsToReturn[item.medicineId._id] || ''}
                                                onChange={(e) => handleReturnQuantityChange(item.medicineId._id, e.target.value, item.quantity)}
                                                disabled={!itemsToReturn[item.medicineId._id]}
                                                max={item.quantity}
                                                min="1"
                                            />
                                        </td>
                                        <td className="td-style">${item.price.toFixed(2)}</td>
                                        <td className="td-style font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 border-t-2 border-dashed pt-6 flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-800">
                            Total Refund: <span className="text-green-600">${totalRefundAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleProcessReturn} 
                            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center"
                            disabled={Object.keys(itemsToReturn).length === 0}
                        >
                            <FaUndo className="mr-2" /> Process Return
                        </button>
                    </div>
                </motion.div>
            )}

            <style>{`
                .input-style { border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; }
                .btn-primary { display:flex; align-items:center; background-color: #4F46E5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #4338CA; }
                .btn-primary:disabled { background-color: #A5B4FC; cursor: not-allowed; }
                .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .td-style { padding: 1rem; font-size: 0.875rem; color: #374151; }
            `}</style>
        </motion.div>
    );
};

export default PharmacyReturns;
