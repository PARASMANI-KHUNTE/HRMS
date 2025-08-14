import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

// Simple printable invoice view. Opened at /pharmacist/invoices/print/:id
const InvoicePrint = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/pharmacy/invoices/${id}`);
        setInvoice(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load invoice.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-6">Loading invoice...</div>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-600 font-semibold">{error}</p>
      <Link to="/pharmacist/invoices" className="text-indigo-600 underline">Back to Invoices</Link>
    </div>
  );
  if (!invoice) return null;

  const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const patient = invoice.patient || {}; // populated with name/email/phone/address in controller
  const pharmacist = invoice.pharmacistId || {};
  const hospital = invoice.hospitalId || {};

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-md p-6" ref={printRef}>
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pharmacy Invoice</h1>
            <p className="text-sm text-gray-500">Invoice No: {invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">Date: {createdAt.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">{hospital?.name || 'Hospital'}</p>
            <p className="text-sm text-gray-600">{hospital?.address || ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Billed To</h2>
            <p className="text-gray-800">{patient?.name || patient?.firstName || ''} {patient?.lastName || ''}</p>
            <p className="text-sm text-gray-600">{patient?.phone || ''}</p>
            <p className="text-sm text-gray-600">{patient?.email || ''}</p>
            {patient?.address && <p className="text-sm text-gray-600">{patient.address}</p>}
          </div>
          <div className="md:text-right">
            <h2 className="font-semibold text-gray-700 mb-1">Payment</h2>
            <p className="text-gray-800">Method: {invoice.paymentMethod}</p>
            <p className="text-gray-800">Status: {invoice.status}</p>
            {pharmacist?.name && <p className="text-sm text-gray-600">Processed by: {pharmacist.name}</p>}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(invoice.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{it.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{it.quantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{Number(it.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{Number(it.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="w-full md:w-64 bg-gray-50 rounded p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
            {/* Placeholder for taxes/discounts if needed */}
            <div className="flex justify-between text-sm mt-2 border-t pt-2">
              <span className="text-gray-800">Grand Total</span>
              <span className="font-bold">₹{Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 no-print">
          <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Print</button>
          <Link to="/pharmacist/invoices" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Back</Link>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint;
