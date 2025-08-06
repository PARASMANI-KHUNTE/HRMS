import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import Pagination from '../components/Pagination';

const getMethodClass = (method) => {
  switch (method) {
    case 'credit_card': return 'bg-blue-100 text-blue-800';
    case 'cash': return 'bg-green-100 text-green-800';
    case 'bank_transfer': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function SuperadminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const fetchData = async (page, search) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      const res = await api.get('/reception/payment/getall', { params });
      setPayments(res.data.payments);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch payments.');
      console.error(error);
    }
    setLoading(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Payments Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative w-full">
          <input 
            type="text"
            placeholder="Search by patient name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {payments.length === 0 && !loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Payments Found</h3>
          <p className="text-gray-500 mt-2">There are no payments matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-6">Invoice ID</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Method</th>
                <th className="py-3 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {payments.map(p => (
                <tr key={p._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{p.invoiceId?.patientId ? `${p.invoiceId.patientId.firstName} ${p.invoiceId.patientId.lastName}` : 'N/A'}</td>
                  <td className="py-3 px-6 font-mono text-xs">{p.invoiceId?._id || 'N/A'}</td>
                  <td className="py-3 px-6">${(p.amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getMethodClass(p.method)}`}>
                      {p.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-6">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
