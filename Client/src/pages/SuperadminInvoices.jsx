import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaSearch, FaEdit, FaTrash, FaFilePdf, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Pagination from '../components/Pagination';

const getStatusClass = (status) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function EditInvoiceModal({ isOpen, onClose, onSave, invoice }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isOpen && invoice) {
      setStatus(invoice.status);
    }
  }, [isOpen, invoice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...invoice, status });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Edit Invoice Status</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, invoiceId }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center">
                <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete invoice <strong className="font-semibold">#{invoiceId?.slice(-6)}</strong>? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function SuperadminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);

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
      const res = await api.get('/reception/invoice/getall', { params });
      setInvoices(res.data.invoices);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch invoices.');
      console.error(error);
    }
    setLoading(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleUpdateInvoice = async (invoiceData) => {
    try {
      const response = await api.put(`/invoice/update/${invoiceData._id}`, { status: invoiceData.status });
      setInvoices(prev => prev.map(inv => inv._id === invoiceData._id ? response.data.invoice : inv));
      toast.success('Invoice status updated successfully.');
      setEditingInvoice(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update invoice.');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    try {
      const response = await api.delete('/invoice/delete', { data: { id: deletingInvoice._id } });
      setInvoices(prev => prev.filter(i => i._id !== response.data.invoiceId));
      toast.success('Invoice deleted successfully!');
      setDeletingInvoice(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice.');
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    try {
        const response = await api.get(`/invoice/pdf/${invoiceId}`, {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `invoice-${invoiceId}.pdf`;
        link.click();
        toast.success('Invoice downloaded.');
    } catch (error) {
        toast.error('Failed to download invoice PDF.');
    }
  };



  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Invoices Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative w-full">
          <input 
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {invoices.length === 0 && !loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Invoices Found</h3>
          <p className="text-gray-500 mt-2">There are no invoices matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-6">Hospital</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {invoices.map(i => (
                <tr key={i._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{i.patientId ? `${i.patientId.firstName} ${i.patientId.lastName}` : 'N/A'}</td>
                  <td className="py-3 px-6">{i.hospitalId?.name || 'N/A'}</td>
                  <td className="py-3 px-6">${(i.total || 0).toFixed(2)}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => handleDownloadPdf(i._id)} className="text-green-500 hover:text-green-700 text-xl" title="Download PDF"><FaFilePdf /></button>
                      <button onClick={() => setEditingInvoice(i)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit Status"><FaEdit /></button>
                      <button onClick={() => setDeletingInvoice(i)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
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

      <EditInvoiceModal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} onSave={handleUpdateInvoice} invoice={editingInvoice} />
      <DeleteConfirmationModal isOpen={!!deletingInvoice} onClose={() => setDeletingInvoice(null)} onConfirm={handleDeleteInvoice} invoiceId={deletingInvoice?._id} />
    </div>
  );
}
