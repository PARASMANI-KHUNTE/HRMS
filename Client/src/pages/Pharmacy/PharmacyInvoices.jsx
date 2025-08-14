import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaEye } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PharmacyInvoices = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/pharmacy/invoices?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setInvoices(data.invoices || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const openDetails = async (invoiceId) => {
    try {
      setDetailLoading(true);
      const { data } = await api.get(`/pharmacy/invoices/${invoiceId}`);
      setSelectedInvoice(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => setSelectedInvoice(null);

  const displayPatientName = (patient) => {
    if (!patient) return '-';
    if (patient.name) return patient.name;
    const fn = patient.firstName || '';
    const ln = patient.lastName || '';
    const full = `${fn} ${ln}`.trim();
    return full || patient.email || patient.phone || '-';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoice History</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or patient"
            className="bg-transparent outline-none w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
          Search
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th-style">Invoice #</th>
              <th className="th-style">Patient</th>
              <th className="th-style">Amount</th>
              <th className="th-style">Date</th>
              <th className="th-style">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading invoices...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No invoices found</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id}>
                  <td className="td-style font-semibold">{inv.invoiceNumber || inv._id}</td>
                  <td className="td-style">{displayPatientName(inv.patient)}</td>
                  <td className="td-style">₹{(inv.totalAmount || 0).toFixed(2)}</td>
                  <td className="td-style">{inv.createdAt ? format(new Date(inv.createdAt), 'PP') : '-'}</td>
                  <td className="td-style">
                    <div className="flex items-center gap-4">
                      <button onClick={() => openDetails(inv._id)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                        <FaEye /> View
                      </button>
                      <Link to={`/pharmacist/invoices/print/${inv._id}`} className="text-green-600 hover:text-green-800">Print</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-3 py-2 bg-gray-100 rounded-md border hover:bg-gray-200 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <button
          className="px-3 py-2 bg-gray-100 rounded-md border hover:bg-gray-200 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invoice Details</h2>
              <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {detailLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500">Invoice #:</span> <span className="font-semibold">{selectedInvoice.invoiceNumber || selectedInvoice._id}</span></div>
                  <div><span className="text-gray-500">Date:</span> <span className="font-semibold">{selectedInvoice.createdAt ? format(new Date(selectedInvoice.createdAt), 'PPpp') : '-'}</span></div>
                  <div><span className="text-gray-500">Patient:</span> <span className="font-semibold">{displayPatientName(selectedInvoice.patient)}</span></div>
                  <div><span className="text-gray-500">Amount:</span> <span className="font-semibold">₹{(selectedInvoice.totalAmount || 0).toFixed(2)}</span></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="th-style">Medicine</th>
                        <th className="th-style">Qty</th>
                        <th className="th-style">Price</th>
                        <th className="th-style">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedInvoice.items || []).map((item) => (
                        <tr key={item._id || item.medicineId}>
                          <td className="td-style">{item.medicineId?.name || '-'}</td>
                          <td className="td-style">{item.quantity}</td>
                          <td className="td-style">₹{(item.price || 0).toFixed(2)}</td>
                          <td className="td-style font-semibold">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .td-style { padding: 1rem; font-size: 0.875rem; color: #374151; }
      `}</style>
    </motion.div>
  );
};

export default PharmacyInvoices;
