import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaPlusCircle, FaTrash, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';

const PharmacyBilling = () => {
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [debouncedPatientSearch] = useDebounce(patientSearchTerm, 500); 
    const [patientResults, setPatientResults] = useState([]);
    const [isPatientLoading, setIsPatientLoading] = useState(false);
    const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
    const [debouncedMedicineSearch] = useDebounce(medicineSearchTerm, 500);
    const [medicineResults, setMedicineResults] = useState([]);
    const [isMedicineLoading, setIsMedicineLoading] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isCreditSale, setIsCreditSale] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState([]);

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        const searchMedicines = async () => {
            if (debouncedMedicineSearch.length < 2) {
                setMedicineResults([]);
                return;
            }
            setIsMedicineLoading(true);
            try {
                const { data } = await api.get(`/pharmacy/medicines?search=${debouncedMedicineSearch}&limit=5`);
                setMedicineResults(data.medicines);
            } catch (error) {
                toast.error('Failed to search for medicines.');
            } finally {
                setIsMedicineLoading(false);
            }
        };
        searchMedicines();
    }, [debouncedMedicineSearch]);

    useEffect(() => {
        const searchPatients = async () => {
            if (debouncedPatientSearch.length < 2) {
                setPatientResults([]);
                return;
            }
            setIsPatientLoading(true);
            try {
                const { data } = await api.get(`/pharmacy/patients?search=${debouncedPatientSearch}&limit=5`);
                setPatientResults(data.patients);
            } catch (error) {
                toast.error('Failed to search for patients.');
            } finally {
                setIsPatientLoading(false);
            }
        };
        searchPatients();
    }, [debouncedPatientSearch]);

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setIsCreditSale(false); // reset credit on new selection
        setPatientSearchTerm('');
        setPatientResults([]);
    };

    const handleQuantityChange = (medicineId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        setInvoiceItems(prevItems =>
            prevItems.map(item =>
                item.medicineId === medicineId ? { ...item, quantity: quantity > 0 ? quantity : 1 } : item
            )
        );
    };

    const handleCreateInvoice = async () => {
        if (!selectedPatient) {
            toast.error('Please select a patient first.');
            return;
        }
        if (invoiceItems.length === 0) {
            toast.error('Cannot create an empty invoice. Please add medicines.');
            return;
        }

        const invoiceData = {
            patientId: selectedPatient._id,
            items: invoiceItems.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, price: item.price })),
            totalAmount,
            paymentMethod: isCreditSale ? 'Credit' : 'Cash',
            status: isCreditSale ? 'Unpaid' : 'Paid',
        };

        try {
            await api.post('/pharmacy/invoices', invoiceData);
            toast.success('Invoice created successfully!');
            // Reset state
            setSelectedPatient(null);
            setInvoiceItems([]);
            setPatientSearchTerm('');
            setMedicineSearchTerm('');
            setIsCreditSale(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create invoice.';
            toast.error(errorMessage);
            console.error(error);
        }
    };

    const removeInvoiceItem = (medicineId) => {
        setInvoiceItems(prevItems => prevItems.filter(item => item.medicineId !== medicineId));
    };

    const addMedicineToInvoice = (medicine) => {
        setInvoiceItems(prevItems => {
            const existingItem = prevItems.find(item => item.medicineId === medicine._id);
            if (existingItem) {
                // Increase quantity if item already exists
                return prevItems.map(item =>
                    item.medicineId === medicine._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Add new item (use unitPrice from medicine)
                return [...prevItems, { medicineId: medicine._id, name: medicine.name, price: medicine.unitPrice, quantity: 1 }];
            }
        });
        setMedicineSearchTerm(''); // Clear search after adding
        setMedicineResults([]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
        >
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Point of Sale (Billing)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Search and Add */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Patient Search */}
                    <div className="card-style relative">
                        <h2 className="font-bold text-lg mb-4">1. Select Patient</h2>
                        {!selectedPatient ? (
                            <div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Search by Patient ID or Name..." 
                                        className="input-style flex-grow" 
                                        value={patientSearchTerm}
                                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                                    />
                                </div>
                                {isPatientLoading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
                                {patientResults.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white shadow-lg rounded-md mt-2 border max-h-60 overflow-y-auto">
                                        {patientResults.map(p => (
                                            <div key={p._id} onClick={() => selectPatient(p)} className="p-3 hover:bg-indigo-50 cursor-pointer border-b">
                                                <p className="font-semibold">{p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()}</p>
                                                <p className="text-sm text-gray-600">{p.phone || p.email || ''}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-indigo-800">{selectedPatient.name || `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim()}</p>
                                        <p className="text-sm text-indigo-600">{selectedPatient.phone || selectedPatient.email || ''}</p>
                                    </div>
                                    <button onClick={() => setSelectedPatient(null)} className="text-red-500 hover:text-red-700">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        id="creditSale"
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={isCreditSale}
                                        onChange={(e) => setIsCreditSale(e.target.checked)}
                                        disabled={!selectedPatient?.admitted}
                                        title={!selectedPatient?.admitted ? 'Credit sales are only for admitted patients' : ''}
                                    />
                                    <label htmlFor="creditSale" className={`text-sm ${!selectedPatient?.admitted ? 'text-gray-400' : 'text-gray-700'}`}>
                                        Credit Sale (admitted patients only)
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medicine Search */}
                    <div className="card-style relative">
                        <h2 className="font-bold text-lg mb-4">2. Add Medicines</h2>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Search Medicine by name..."
                                className="input-style flex-grow" 
                                value={medicineSearchTerm}
                                onChange={(e) => setMedicineSearchTerm(e.target.value)}
                            />
                        </div>
                        {isMedicineLoading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
                        {medicineResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-2 border max-h-60 overflow-y-auto">
                                {medicineResults.map(med => (
                                    <div key={med._id} onClick={() => addMedicineToInvoice(med)} className="p-3 hover:bg-indigo-50 cursor-pointer border-b">
                                        <p className="font-semibold">{med.name}</p>
                                        <p className="text-sm text-gray-600">{med.manufacturer} - Stock: {med.stockQuantity}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Invoice Cart */}
                <div className="lg:col-span-2 card-style">
                    <h2 className="font-bold text-lg mb-4">Current Invoice</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-style">Medicine</th>
                                    <th className="th-style">Qty</th>
                                    <th className="th-style">Price</th>
                                    <th className="th-style">Total</th>
                                    <th className="th-style"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoiceItems.length > 0 ? (
                                    invoiceItems.map(item => (
                                        <tr key={item.medicineId}>
                                            <td className="td-style font-medium">{item.name}</td>
                                            <td className="td-style">
                                                <input 
                                                    type="number" 
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.medicineId, e.target.value)}
                                                    className="input-style w-20 text-center"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="td-style">₹{item.price.toFixed(2)}</td>
                                            <td className="td-style font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            <td className="td-style">
                                                <button onClick={() => removeInvoiceItem(item.medicineId)} className="text-red-500 hover:text-red-700">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">Invoice is empty</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-dashed">
                        <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <button onClick={handleCreateInvoice} className="btn-primary w-full mt-6 text-lg" disabled={!selectedPatient || invoiceItems.length === 0}>
                            Create Invoice
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .card-style { background-color: #F9FAFB; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
                .input-style { border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; }
                .btn-primary { background-color: #4F46E5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #4338CA; }
                .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .td-style { padding: 1rem; font-size: 0.875rem; color: #374151; }
            `}</style>
        </motion.div>
    );
};

export default PharmacyBilling;

