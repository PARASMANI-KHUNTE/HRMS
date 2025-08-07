import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCapsules, FaExclamationTriangle, FaFileInvoiceDollar, FaChartLine } from 'react-icons/fa';
import api from '../../utils/api';
import { format } from 'date-fns';

const StatCard = ({ icon, title, value, color }) => (
    <motion.div 
        className={`bg-white rounded-xl shadow-lg p-6 flex items-center gap-6 border-l-4 ${color}`}
        whileHover={{ scale: 1.05 }}
    >
        {icon}
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </motion.div>
);

const PharmacyDashboard = () => {
    const [stats, setStats] = useState({ totalMedicines: 0, lowStock: 0, totalSales: 0, totalRevenue: 0 });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/pharmacy/dashboard-stats');
                setStats({
                    totalMedicines: data.totalMedicines,
                    lowStock: data.lowStock,
                    totalSales: data.totalSales,
                    totalRevenue: data.totalRevenue,
                });
                setRecentInvoices(data.recentInvoices);
                setLowStockItems(data.lowStockItems);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
                // Here you could set an error state and display a toast message
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Pharmacy Dashboard</h1>

            {loading ? (
                <div className="text-center p-8">Loading dashboard...</div>
            ) : (
            <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<FaCapsules size={32} className="text-blue-500" />} title="Total Medicines" value={stats.totalMedicines} color="border-blue-500" />
                <StatCard icon={<FaExclamationTriangle size={32} className="text-yellow-500" />} title="Low Stock Items" value={stats.lowStock} color="border-yellow-500" />
                <StatCard icon={<FaFileInvoiceDollar size={32} className="text-green-500" />} title="Total Sales" value={stats.totalSales} color="border-green-500" />
                <StatCard icon={<FaChartLine size={32} className="text-purple-500" />} title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="border-purple-500" />
            </div>

            {/* Recent Sales and Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Invoices */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sales</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-style">Invoice ID</th>
                                    <th className="th-style">Patient</th>
                                    <th className="th-style">Amount</th>
                                    <th className="th-style">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentInvoices.map(invoice => (
                                    <tr key={invoice._id}>
                                        <td className="td-style font-medium">{invoice._id}</td>
                                        <td className="td-style">{invoice.patientId.name}</td>
                                        <td className="td-style">${invoice.totalAmount.toFixed(2)}</td>
                                        <td className="td-style">{format(new Date(invoice.createdAt), 'PP')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Low Stock Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-style">Medicine</th>
                                    <th className="th-style">Stock Left</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {lowStockItems.map(item => (
                                    <tr key={item.name}>
                                        <td className="td-style font-medium">{item.name}</td>
                                        <td className="td-style text-red-500 font-bold">{item.stockQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </>
            )}
            <style>{`
                .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .td-style { padding: 1rem; font-size: 0.875rem; color: #374151; }
            `}</style>
        </motion.div>
    );
};

export default PharmacyDashboard;
