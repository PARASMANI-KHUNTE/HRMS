import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PharmacyReports = () => {
    const [activeTab, setActiveTab] = useState('sales');

    const renderContent = () => {
        switch (activeTab) {
            case 'sales':
                return <div>Sales Report Content</div>;
            case 'returns':
                return <div>Returns Report Content</div>;
            case 'inventory':
                return <div>Inventory Logs Content</div>;
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-50 min-h-full"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Reports</h1>
            
            <div className="bg-white rounded-xl shadow-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6 p-4">
                        <button 
                            onClick={() => setActiveTab('sales')}
                            className={`py-2 px-4 font-medium text-sm rounded-md transition-colors ${activeTab === 'sales' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Sales Reports
                        </button>
                        <button 
                            onClick={() => setActiveTab('returns')}
                            className={`py-2 px-4 font-medium text-sm rounded-md transition-colors ${activeTab === 'returns' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Returns Reports
                        </button>
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`py-2 px-4 font-medium text-sm rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Inventory Logs
                        </button>
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </motion.div>
    );
};

export default PharmacyReports;
